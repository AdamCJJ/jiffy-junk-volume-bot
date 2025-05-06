require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(bodyParser.json({ limit: '25mb' }));
app.use(express.static('public'));

const systemPrompt = `
You are the Jiffy Junk Volume Assistant.
Estimate the total cubic yards of junk based on the user's description and/or image.
Assume 15-yard trucks by default unless another size is mentioned.
Avoid counting duplicates. Return only volume — no pricing.
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
        content: [
          { type: 'text', text: message || 'Estimate volume from image only.' }
        ]
      }
    ];

    if (images && images.length > 0) {
      for (const base64 of images) {
        messages[1].content.push({
          type: 'image_url',
          image_url: {
            url: base64
          }
        });
      }
    }

   const completion = await openai.chat.completions.create({
  model: 'gpt-4o',  // <-- new correct model
  messages,
  max_tokens: 1000
});

    const reply = completion.choices?.[0]?.message?.content;
    res.json({ reply });
  } catch (err) {
    console.error('[GPT ERROR]', err);
    res.status(500).json({ reply: `Error: ${err.message}` });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
