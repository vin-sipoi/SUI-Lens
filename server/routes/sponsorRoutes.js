import express from 'express';
import Joi from 'joi';

const router = express.Router();

// Initialize Enoki client
if (!process.env.ENOKI_PRIVATE_KEY) {
    console.warn('ENOKI_PRIVATE_KEY environment variable is not set. Sponsored transactions will not work.');
}

// Function to get Enoki client instance
async function getEnokiClient() {
    const { EnokiClient } = await import('@mysten/enoki');
    
    // Use global fetch if available (Node.js 18+), otherwise fall back to node-fetch
    let fetchImplementation;
    if (typeof globalThis.fetch === 'function') {
        fetchImplementation = globalThis.fetch;
    } else {
        // Fallback for older Node.js versions
        const { default: nodeFetch } = await import('node-fetch');
        fetchImplementation = nodeFetch;
    }
    
    return new EnokiClient({
        apiKey: process.env.ENOKI_PRIVATE_KEY,
        fetch: fetchImplementation,
    });
}

// Validation schemas
const sponsorTransactionSchema = Joi.object({
    transactionKindBytes: Joi.string().required().messages({
        'string.empty': 'Transaction kind bytes is required',
        'any.required': 'Transaction kind bytes is required'
    }),
    sender: Joi.string().required().messages({
        'string.empty': 'Sender address is required',
        'any.required': 'Sender address is required'
    }),
    allowedMoveCallTargets: Joi.array().items(Joi.string()).optional(),
    allowedAddresses: Joi.array().items(Joi.string()).optional(),
    network: Joi.string().valid('testnet', 'mainnet', 'devnet').default('testnet')
});

const executeTransactionSchema = Joi.object({
    digest: Joi.string().required().messages({
        'string.empty': 'Transaction digest is required',
        'any.required': 'Transaction digest is required'
    }),
    signature: Joi.string().required().messages({
        'string.empty': 'Transaction signature is required',
        'any.required': 'Transaction signature is required'
    })
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Enoki sponsor service is running',
        enokiConfigured: !!process.env.ENOKI_PRIVATE_KEY
    });
});

// Sponsor transaction endpoint
router.post('/sponsor-transaction', async (req, res) => {
    try {
        // Validate request body
        const { error, value } = sponsorTransactionSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                error: 'Validation failed',
                details: error.details 
            });
        }

        const { transactionKindBytes, sender, allowedMoveCallTargets, allowedAddresses, network } = value;

        // Check if Enoki is configured
        if (!process.env.ENOKI_PRIVATE_KEY) {
            return res.status(500).json({ 
                error: 'Enoki not configured',
                message: 'ENOKI_PRIVATE_KEY environment variable is not set'
            });
        }

        console.log(`Sponsoring transaction for ${sender} on ${network}`);

        console.log('Creating sponsored transaction with parameters:');
        console.log('- Network:', network);
        console.log('- Sender:', sender);
        console.log('- Transaction kind bytes length:', transactionKindBytes.length);
        console.log('- Allowed move call targets:', allowedMoveCallTargets || 'none');
        console.log('- Allowed addresses:', allowedAddresses || [sender]);

        // Create sponsored transaction with manual gas budget
        const enokiClient = await getEnokiClient();
        try {
            const sponsored = await enokiClient.createSponsoredTransaction({
                network: network,
                transactionKindBytes: transactionKindBytes,
                sender: sender,
                allowedMoveCallTargets: allowedMoveCallTargets,
                allowedAddresses: allowedAddresses || [sender],
                // Add manual gas budget to help with dry run issues
                gasBudget: 100000000, // 0.1 SUI in MIST
            });

            console.log('Sponsorship successful!');
            console.log('- Transaction digest:', sponsored.digest);
            console.log('- Bytes length:', sponsored.bytes.length);

            res.json({
                success: true,
                bytes: sponsored.bytes,
                digest: sponsored.digest,
                network: network
            });
        } catch (enokiError) {
            console.error('Enoki API error details:', {
                message: enokiError.message,
                code: enokiError.code,
                status: enokiError.status
            });
            
            // Check if it's a dry run failure and provide more specific error
            if (enokiError.code === 'dry_run_failed') {
                console.error('DRY_RUN_FAILED: This usually indicates issues with:');
                console.error('1. Transaction parameters');
                console.error('2. Contract validation');
                console.error('3. Insufficient gas budget');
                console.error('4. Invalid sender address or permissions');
                
                // Try with a different approach - use automatic gas estimation
                try {
                    console.log('Retrying with automatic gas estimation...');
                    const sponsored = await enokiClient.createSponsoredTransaction({
                        network: network,
                        transactionKindBytes: transactionKindBytes,
                        sender: sender,
                        allowedMoveCallTargets: allowedMoveCallTargets,
                        allowedAddresses: allowedAddresses || [sender],
                        // Let Enoki handle gas estimation
                    });
                    
                    console.log('Retry successful with automatic gas estimation!');
                    res.json({
                        success: true,
                        bytes: sponsored.bytes,
                        digest: sponsored.digest,
                        network: network
                    });
                } catch (retryError) {
                    console.error('Retry also failed:', retryError.message);
                    throw retryError;
                }
            } else {
                throw enokiError;
            }
        }

    } catch (error) {
        console.error('Error sponsoring transaction:', error);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        
        // Enhanced error logging for Enoki API
        if (error.response) {
            console.error('Enoki API response status:', error.response.status);
            console.error('Enoki API response status text:', error.response.statusText);
            
            try {
                const responseText = await error.response.text();
                console.error('Enoki API response body:', responseText);
                
                // Try to parse as JSON for more detailed error information
                try {
                    const responseJson = JSON.parse(responseText);
                    console.error('Enoki API response JSON:', JSON.stringify(responseJson, null, 2));
                    
                    // Extract detailed error information for dry_run_failed
                    if (responseJson.code === 'dry_run_failed' && responseJson.details) {
                        console.error('DRY_RUN_FAILED_DETAILS:', responseJson.details);
                        
                        // Check for MoveAbort errors
                        if (responseJson.details.includes('MoveAbort')) {
                            console.error('MOVE_ABORT_ERROR: This indicates a contract validation failure');
                            console.error('Check the transaction parameters and contract requirements');
                        }
                    }
                } catch (parseError) {
                    console.error('Could not parse response as JSON:', parseError);
                }
            } catch (e) {
                console.error('Could not read response body:', e);
            }
        }
        
        // Check if error has additional properties
        if (error.cause) {
            console.error('Error cause:', error.cause);
        }
        
        // Check if it's an Enoki API error with specific details
        if (error.message && error.message.includes('invalid_type')) {
            console.error('ENOKI_KEY_DEBUG: Checking Enoki key format and permissions...');
            console.error('ENOKI_KEY_DEBUG: Key starts with:', process.env.ENOKI_PRIVATE_KEY?.substring(0, 20) + '...');
            console.error('ENOKI_KEY_DEBUG: Network being used:', network);
        }
        
        // Extract more detailed error information
        let errorDetails = error.message || 'Unknown error';
        let errorCode = error.code || 'UNKNOWN_ERROR';
        
        if (error.response) {
            try {
                const responseText = await error.response.text();
                const responseJson = JSON.parse(responseText);
                errorDetails = responseJson.details || responseJson.message || error.message || 'Unknown error';
                errorCode = responseJson.code || error.code || 'UNKNOWN_ERROR';
            } catch (e) {
                // If we can't parse the response, use the original error
            }
        }
        
        res.status(500).json({ 
            error: 'Failed to sponsor transaction',
            details: errorDetails,
            code: errorCode,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Execute sponsored transaction endpoint
router.post('/execute-transaction', async (req, res) => {
    try {
        // Validate request body
        const { error, value } = executeTransactionSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                error: 'Validation failed',
                details: error.details 
            });
        }

        const { digest, signature } = value;

        // Check if Enoki is configured
        if (!process.env.ENOKI_PRIVATE_KEY) {
            return res.status(500).json({ 
                error: 'Enoki not configured',
                message: 'ENOKI_PRIVATE_KEY environment variable is not set'
            });
        }

        console.log(`Executing sponsored transaction with digest: ${digest}`);

        // Execute the sponsored transaction
        const enokiClient = await getEnokiClient();
        const result = await enokiClient.executeSponsoredTransaction({
            digest,
            signature,
        });

        res.json({
            success: true,
            result: result,
            digest: digest
        });

    } catch (error) {
        console.error('Error executing transaction:', error);
        res.status(500).json({ 
            error: 'Failed to execute transaction',
            details: error.message,
            code: error.code
        });
    }
});

export default router;
