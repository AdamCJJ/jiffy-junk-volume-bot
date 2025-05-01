require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '25mb' }));
app.use(express.static('public'));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `
You are the Jiffy Junk Volume Assistant.
Estimate the cubic yards of junk based on the user's input (description and/or images).
Assume 15-yard trucks by default. If the user asks how full the truck is, ask what size it is before giving a fraction.
Respond ONLY with the estimated cubic yards (and fraction when asked), without any pricing information.
`;

app.post('/api/chat', async (req, res) => {
  try {
    const { message, images } = req.body;

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: []
      }
    ];

    if (message && message.trim() !== '') {
      messages[1].content.push({ type: 'text', text: message });
    }

    if (images && images.length > 0) {
      for (const img of images) {
        messages[1].content.push({
          type: 'image_url',
          image_url: {
            url: img
          }
        });
      }
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages
    });

    const reply = completion.choices[0].message.content.trim();
    res.json({ reply });

  } catch (err) {
    console.error('[GPT ERROR]', err);
    res.status(500).json({ reply: `Error: ${err.message || 'Unknown error'}` });
  }
});

// Serve index.html at the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
