require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('public'));

const systemPrompt = `
You are the Jiffy Junk Volume Assistant.
Estimate the total cubic yards of junk based on the user's description and/or annotated image.
Always avoid double-counting overlapping or duplicate items shown in multiple photos.
Assume 15-yard trucks by default, unless another size is mentioned.
If asked "how full is this truck?", ask for the truck's size before giving a fraction.
Respond only with estimated volume — never include pricing or unrelated commentary.
`;

app.post('/api/chat', async (req, res) => {
  try {
    const { message, images } = req.body;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message || 'Estimate volume based on image only.' }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages
    });

    const reply = completion.choices[0].message.content.trim();
    res.json({ reply });
  } catch (err) {
    console.error('[GPT ERROR]', err);
    res.status(500).json({ reply: `Error: ${err.message || 'Unknown GPT error'}` });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
