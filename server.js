// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `
You are the Jiffy Junk Volume Assistant.
Estimate the cubic yards of junk based on the user's description and/or an annotated image.
Assume 15-yard trucks by default unless the user specifies another size.
If asked how full the truck is, ask for truck size before giving a fraction.
Avoid duplicate counting of the same item across multiple images.
Only return estimated volume — do not include pricing.
`;

app.post('/api/chat', async (req, res) => {
  try {
    const { message, images } = req.body;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message || 'Estimate volume based on image.' }
    ];

    // Optional: if vision model supported in future:
    // Add image inputs if model supports base64 (currently text-only model is used)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages
    });

    const reply = completion.choices[0].message.content.trim();
    res.json({ reply });
  } catch (err) {
    console.error('[GPT ERROR]', err);
    res.status(500).json({ reply: `Server error: ${err.message || 'Unknown error'}` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
