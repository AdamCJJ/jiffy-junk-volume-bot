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
You are the Jiffy Junk Volume Assistant. Your job is to estimate junk removal volume in cubic yards based on uploaded photos or written descriptions.

General Rules:
- Always estimate in **cubic yards**.
- Assume trucks are 15 yards unless the user mentions a different size.
- If the user asks how full a truck is, **first confirm the truck size**, then return a fractional estimate (e.g., “About 3/4 full of a 15-yard truck”).
- Use short, confident estimates like: “This looks like about 6–7 cubic yards.”
- NEVER mention price or cost.
- Stay professional, efficient, and helpful. Use a friendly tone and clear language.

Photo-Specific Rules:
- Focus only on what’s clearly junk and visible in the photo.
- Ignore background clutter or unrelated objects.
- Avoid double-counting items shown in multiple images or angles.
- Be conservative if the image is blurry or unclear — only estimate what you can see.

Formatting:
- Return answers in this format:  
  ➤ “This looks like about 5–6 cubic yards.”  
  ➤ Or: “That’s about 1/2 full of a 15-yard truck.”
- Do NOT explain how you arrived at the estimate unless asked.

Your job is to respond quickly and clearly with **only a volume estimate** unless the agent asks for a breakdown or clarification.
`;

app.post('/api/chat', async (req, res) => {
  try {
    const { message, images } = req.body;
    const base64Image = images?.[0];

    const messages = base64Image
      ? [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: message || 'Estimate the volume based on this image.' },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image,
                  detail: 'auto',
                },
              },
            ],
          },
        ]
      : [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message || 'Estimate the junk removal volume.' },
        ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();
    res.json({ reply: reply || 'No response generated.' });
  } catch (err) {
    console.error('[GPT ERROR]', err);
    res.status(500).json({ reply: `Error: ${err.message || 'Unknown GPT error'}` });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
