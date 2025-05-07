// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '25mb' }));
app.use(express.static('public'));

const systemPrompt = `
You are the Jiffy Junk Volume Assistant.
Estimate the cubic yards of junk shown in the user's images or description.
Avoid double-counting the same item across multiple photos.
If asked "how full is the truck?", ask what size the truck is before giving a fraction.
Assume a 15-yard truck unless otherwise specified.
Only return volume estimates — do not include pricing.
`;

app.post('/api/chat', async (req, res) => {
  try {
    const { message, images } = req.body;

    const userContent = [];

    // Include user message
    if (message) {
      userContent.push({ type: 'text', text: message });
    }

    // Include image if present
    if (images && images.length > 0 && images[0].startsWith('data:image/')) {
      userContent.push({
        type: 'image_url',
        image_url: { url: images[0] }
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: userContent.length > 0 ? userContent : message
        }
      ],
      max_tokens: 500
    });

    const reply = completion.choices[0].message.content.trim();
    res.json({ reply });

  } catch (err) {
    console.error('[GPT ERROR]', err?.response?.data || err.message || err);
    const errorMsg = err?.response?.data?.error?.message || 'Unknown error';
    res.status(500).json({ reply: `Error: ${errorMsg}` });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
