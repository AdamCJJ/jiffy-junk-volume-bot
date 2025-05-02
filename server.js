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

Only estimate the volume of junk that is clearly visible in the provided images. Do not guess what may be outside the frame or assume anything beyond what is shown.

Estimate the total cubic yards of junk shown in the attached image(s) and/or user description.

Be as consistent and objective as possible. Do not double-count items that appear in more than one image — recognize duplicates and overlapping angles. Count each item or pile only once, based on visual context.

When analyzing truck load photos, focus exclusively on the interior of the truck bed. Use the height and depth of the junk relative to the truck’s side walls as a primary reference. Do not consider the background scenery or unrelated objects outside the truck bed.

Always assume the default truck size is 15 cubic yards unless the user clearly states otherwise. If the user asks how full the truck is (e.g., "Is this 1/3 or 1/2 full?"), respond using that 15-yard assumption unless a different size is specified.

Your response must only include the estimated total cubic yards (and fraction if applicable). Never mention pricing. Never ask follow-up questions unless truck size is unclear.
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
      messages,
      temperature: 0
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



