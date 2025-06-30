const express = require('express');
const router = express.Router();
const { translate } = require('@vitalets/google-translate-api');

// POST /api/translate
router.post('/', async (req, res) => {
  const { text, to } = req.body;
  if (!text || !to) {
    return res.status(400).json({ message: 'Missing text or target language (to)' });
  }
  try {
    const result = await translate(text, { to });
    res.json({ translatedText: result.text });
  } catch (error) {
    res.status(500).json({ message: 'Translation failed', error: error.message });
  }
});

module.exports = router; 