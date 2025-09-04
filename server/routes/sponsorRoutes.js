const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { SuiClient } = require('@mysten/sui/client');

// Initialize Sui client for profile checks
const suiClient = new SuiClient({
    url: process.env.SUI_RPC_URL || 'https://fullnode.mainnet.sui.io:443',
});

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

// Check if user has a profile
async function checkUserProfile(senderAddress, network = 'mainnet') {
    try {
        const packageId = process.env.PACKAGE_ID || process.env.NEXT_PUBLIC_PACKAGE_ID || '';
        const registryId = process.env.EVENT_REGISTRY_ID || process.env.NEXT_PUBLIC_EVENT_REGISTRY_ID || '';

        if (!packageId || !registryId) {
            console.warn('PACKAGE_ID or EVENT_REGISTRY_ID not configured, skipping profile check');
            return false;
        }

        // Query the registry object to check if user has a profile
        const registry = await suiClient.getObject({
            id: registryId,
            options: {
                showContent: true,
            },
        });

        if (!registry.data || !registry.data.content) {
            console.log('Registry object not found or has no content');
            return false;
        }

        // Check if user_profiles table contains the user
        const content = registry.data.content;
        if (content.fields && content.fields.user_profiles) {
            // The user_profiles is a table with ID and size fields
            // We need to check if the specific user address exists in the table
            const userProfilesTable = content.fields.user_profiles;

            // Check if the table has the user by trying to access the dynamic field
            try {
                // Query the specific user's profile using dynamic field access
                const userProfileObject = await suiClient.getDynamicFieldObject({
                    parentId: userProfilesTable.fields.id.id,
                    name: {
                        type: 'address',
                        value: senderAddress,
                    },
                });

                if (userProfileObject.data) {
                    console.log(`User ${senderAddress} has a profile on blockchain`);
                    return true;
                } else {
                    console.log(`User ${senderAddress} does not have a profile on blockchain`);
                    return false;
                }
            } catch (dynamicFieldError) {
                // If dynamic field doesn't exist, user doesn't have a profile
                console.log(`User ${senderAddress} does not have a profile (dynamic field not found):`, dynamicFieldError.message);
                return false;
            }
        }

        console.log('User profiles table not found in registry');
        return false;
    } catch (error) {
        console.log('User profile check failed (assuming no profile exists):', error.message);
        return false;
    }
}

// Create a profile creation transaction
async function createProfileTransaction(senderAddress, packageId, registryId) {
    // This is a simplified profile creation - in production you'd want to get user data
    const profileData = {
        username: `User_${senderAddress.slice(-8)}`,
        bio: 'SUI-Lens user',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + senderAddress,
    };

    // Import Transaction class dynamically to avoid issues
    const { Transaction } = await import('@mysten/sui/transactions');

    // Create transaction using Sui SDK
    const tx = new Transaction();

    // Add the create_profile move call
    tx.moveCall({
        target: `${packageId}::suilens_core::create_profile`,
        arguments: [
            tx.object(registryId), // GlobalRegistry object
            tx.pure.string(profileData.username),
            tx.pure.string(profileData.bio),
            tx.pure.string(profileData.avatarUrl),
            tx.object('0x6'), // Clock object
        ],
    });

    // Set sender to avoid dynamic field borrowing issues
    tx.setSender(senderAddress);

    // Build full transaction first, then extract transaction kind
    try {
        const fullTxBytes = await tx.build({
            client: suiClient,
        });

        // Extract transaction kind from full transaction
        const { TransactionKind } = await import('@mysten/sui/transactions');
        const txData = Transaction.from(fullTxBytes);
        const txKind = txData.getTransactionKind();

        // Build transaction kind bytes
        const txKindBytes = await txKind.build({
            client: suiClient,
            onlyTransactionKind: true
        });

        return {
            transactionKindBytes: Buffer.from(txKindBytes).toString('base64'),
            sender: senderAddress,
            allowedAddresses: [senderAddress],
            network: 'mainnet',
        };
    } catch (error) {
        console.error('Error building profile transaction:', error);
        // Fallback to onlyTransactionKind if full build fails
        const txBytes = await tx.build({
            client: suiClient,
            onlyTransactionKind: true
        });

        return {
            transactionKindBytes: Buffer.from(txBytes).toString('base64'),
            sender: senderAddress,
            allowedAddresses: [senderAddress],
            network: 'mainnet',
        };
    }
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
        console.log('- Transaction kind bytes (first 100 chars):', transactionKindBytes.substring(0, 100));
        console.log('- Allowed move call targets:', allowedMoveCallTargets || 'none');
        console.log('- Allowed addresses:', allowedAddresses || [sender]);

        // Log the full request body for debugging
        console.log('Full request body received:');
        console.log(JSON.stringify({
            transactionKindBytes: transactionKindBytes.substring(0, 200) + '...', // Truncate for readability
            sender,
            allowedMoveCallTargets,
            allowedAddresses,
            network
        }, null, 2));

        // Skip profile creation check for event creation - just proceed with the main transaction
        console.log('Skipping profile creation check for event creation - proceeding directly with main transaction...');

        // Create sponsored transaction with manual gas budget
        const enokiClient = await getEnokiClient();
        try {
            // Remove allowedMoveCallTargets to avoid dynamic field borrow errors
            const sponsored = await enokiClient.createSponsoredTransaction({
                network: network,
                transactionKindBytes: transactionKindBytes,
                sender: sender,
                allowedAddresses: allowedAddresses || [sender],
                // Add manual gas budget to help with dry run issues
                gasBudget: 100000000, // 0.1 SUI in MIST
            });

            console.log('Sponsorship successful!');
            console.log('- Transaction digest:', sponsored.digest);
            console.log('- Bytes length:', sponsored.bytes.length);

            res.json({
                success: true,
                requiresProfileCreation: false,
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
                    // Remove allowedMoveCallTargets here as well
                    const sponsored = await enokiClient.createSponsoredTransaction({
                        network: network,
                        transactionKindBytes: transactionKindBytes,
                        sender: sender,
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
                
                // Check if response is empty
                if (!responseText || responseText.trim() === '') {
                    console.error('Enoki API response is empty');
                } else {
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
                // Check if response is not empty before parsing
                if (responseText && responseText.trim() !== '') {
                    const responseJson = JSON.parse(responseText);
                    errorDetails = responseJson.details || responseJson.message || error.message || 'Unknown error';
                    errorCode = responseJson.code || error.code || 'UNKNOWN_ERROR';
                } else {
                    errorDetails = 'Empty response from Enoki API';
                    errorCode = 'EMPTY_RESPONSE';
                }
            } catch (e) {
                // If we can't parse the response, use the original error
                errorDetails = 'Could not parse response from Enoki API: ' + error.message;
                errorCode = 'PARSE_ERROR';
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
        const enokiResult = await enokiClient.executeSponsoredTransaction({
            digest,
            signature,
        });

        console.log('Enoki execution result:', enokiResult);

        // Get the full transaction details from Sui client to include effects and object changes
        let fullResult;
        try {
            fullResult = await suiClient.getTransactionBlock({
                digest: digest,
                options: {
                    showEffects: true,
                    showObjectChanges: true,
                    showEvents: true,
                },
            });
            console.log('Full transaction result from Sui client:', fullResult);
        } catch (suiError) {
            console.error('Error getting transaction details from Sui client:', suiError);
            // Fallback to Enoki result if Sui client fails
            fullResult = enokiResult;
        }

        const responseData = {
            success: true,
            result: fullResult,
            digest: digest
        };

        console.log('About to send execute response:');
        console.log('Response data keys:', Object.keys(responseData));
        console.log('Response data success:', responseData.success);
        console.log('Response data has result:', !!responseData.result);
        console.log('Response data result type:', typeof responseData.result);
        console.log('Response data digest:', responseData.digest);

        // Send the response
        res.json(responseData);
        console.log('Execute response sent successfully');

    } catch (error) {
        console.error('Error executing transaction:', error);
        console.error('Error stack:', error.stack);

        // Check if headers have already been sent
        if (res.headersSent) {
            console.error('Headers already sent, cannot send error response');
            return;
        }

        res.status(500).json({
            error: 'Failed to execute transaction',
            details: error.message,
            code: error.code
        });
    }
});

module.exports = router;
