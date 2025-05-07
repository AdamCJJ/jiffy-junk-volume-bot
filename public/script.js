require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '25mb' }));
app.use(express.static('public'));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `
You are the Jiffy Junk Volume Assistant.
Estimate the total cubic yards of junk based on the user's description and uploaded image.
Do not double count overlapping or duplicate items from multiple photos.
Assume 15-yard trucks by default unless another size is mentioned.
If asked how full a truck is, ask what size it is before estimating fraction.
Only provide estimated volume—no pricing.
`;

app.post('/api/chat', async (req, res) => {
  try {
    const { message, images } = req.body;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message || 'Estimate the volume from this photo.' }
    ];

    const base64Image = images?.[0];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      ...(base64Image && {
        tools: [{ type: "image_url" }],
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: message || 'Estimate the volume from this photo.' },
              {
                type: 'image_url',
                image_url: { url: base64Image }
              }
            ]
          }
        ]
      })
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();
    res.json({ reply: reply || 'No response generated' });
  } catch (err) {
    console.error('[GPT ERROR]', err);
    res.status(500).json({ reply: `Error: ${err.message || 'Unknown error'}` });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
