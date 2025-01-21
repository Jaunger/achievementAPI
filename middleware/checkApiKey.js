// middleware/checkApiKey.js
const ApiKey = require('../models/ApiKey');

module.exports = async function checkApiKey(req, res, next) {
  try {
    const apiKeyValue = req.header('x-api-key');
    if (!apiKeyValue) {
      return res.status(401).json({ error: 'API key missing' });
    }

    const apiKeyDoc = await ApiKey.findOne({ key: apiKeyValue });
    if (!apiKeyDoc) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Check expiration
    if (new Date() > apiKeyDoc.expDate) {
      return res.status(403).json({ error: 'API key expired' });
    }

    // Attach it to req for downstream controllers
    // So we know which list is authorized
    req.apiKey = apiKeyDoc;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};