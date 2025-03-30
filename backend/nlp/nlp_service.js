const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

app.post('/nlp', (req, res) => {
    const { text } = req.body; // Extract 'text'

    if (!text) {
        return res.status(400).json({ message: "Text is required." });
    }

    // Processing logic
    const processedData = analyzeText(text);

    res.json({ message: "NLP processing complete", data: processedData });
});

// Example NLP function
const analyzeText = (text) => {
    return `Processed: ${text}`;
};

app.listen(PORT, () => {
    console.log(`NLP Service running on port ${PORT}`);
});