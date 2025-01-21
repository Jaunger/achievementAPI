const ApiKey = require('../models/ApiKey');

const validateApiKey = async (req, res, next) => {
    try {
        const key = req.header('x-api-key'); // Get API key from headers

        if (!key) {
            return res.status(401).json({ error: 'API Key is required' });
        }

        // Check if the API key exists
        const apiKey = await ApiKey.findOne({ key });
        if (!apiKey) {
            return res.status(403).json({ error: 'Invalid API Key' });
        }

        // Check if the API key is expired
        const now = new Date();
        if (now > apiKey.expDate) {
            return res.status(403).json({ error: 'API Key has expired' });
        }

        // Attach listId to the request object for downstream routes
        req.listId = apiKey.listId;

        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error('Error validating API Key:', err);
        res.status(500).json({ error: 'Failed to validate API Key' });
    }
};

module.exports = validateApiKey;