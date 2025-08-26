const express = require('express');
const router = express.Router();
const Joi = require('joi');

// Initialize Enoki client
if (!process.env.ENOKI_PRIVATE_KEY) {
    console.warn('ENOKI_PRIVATE_KEY environment variable is not set. Sponsored transactions will not work.');
}

// Function to get Enoki client instance
async function getEnokiClient() {
    const { EnokiClient } = await import('@mysten/enoki');
    return new EnokiClient({
        apiKey: process.env.ENOKI_PRIVATE_KEY,
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

        // Create sponsored transaction
        const enokiClient = await getEnokiClient();
        const sponsored = await enokiClient.createSponsoredTransaction({
            network: network,
            transactionKindBytes: transactionKindBytes,
            sender: sender,
            allowedMoveCallTargets: allowedMoveCallTargets,
            allowedAddresses: allowedAddresses || [sender],
        });

        res.json({
            success: true,
            bytes: sponsored.bytes,
            digest: sponsored.digest,
            network: network
        });

    } catch (error) {
        console.error('Error sponsoring transaction:', error);
        res.status(500).json({ 
            error: 'Failed to sponsor transaction',
            details: error.message,
            code: error.code
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

module.exports = router;
