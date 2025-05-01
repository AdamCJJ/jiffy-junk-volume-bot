require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
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
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message || 'Estimate volume based on images only.' }
    ];

    // Optional: add base64 image refs (if vision model supported — placeholder for future use)

   const completion = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: messages
});


    const reply = completion.choices[0].message.content.trim();
    res.json({ reply });
 } catch (err) {
  console.error('[GPT ERROR]', err);
    res.status(500).json({ reply: `Error: ${err.message || 'Unknown error'}` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
