// === script.js (client-side) === console.log('Script loaded');

const chat = document.getElementById('chat'); const textarea = document.getElementById('message'); const sendBtn = document.getElementById('send');

function appendMessage(role, text) { const msg = document.createElement('div'); msg.className = 'mb-2'; msg.innerHTML = <strong>${role}:</strong> ${text}; chat.appendChild(msg); chat.scrollTop = chat.scrollHeight; }

function getAnnotatedImageBase64() { return stage ? stage.toDataURL({ pixelRatio: 2 }) : ''; }

sendBtn.addEventListener('click', async () => { const message = textarea.value.trim(); const imageBase64 = getAnnotatedImageBase64();

if (!message && !imageBase64) return;

appendMessage('You', message || '[Image only]'); textarea.value = '';

try { const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, images: imageBase64 ? [imageBase64] : [] }) });

const data = await response.json();
appendMessage('Assistant', data.reply);

} catch (err) { appendMessage('Assistant', 'Error: Could not connect to server'); } });

// === server.js (backend) === require('dotenv').config(); const express = require('express'); const cors = require('cors'); const bodyParser = require('body-parser'); const { OpenAI } = require('openai');

const app = express(); const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors()); app.use(bodyParser.json({ limit: '25mb' })); app.use(express.static('public'));

const systemPrompt = You are the Jiffy Junk Volume Assistant. Estimate the total cubic yards of junk based on the user's description and/or annotated image. Always avoid double-counting overlapping or duplicate items shown in multiple photos. Assume 15-yard trucks by default, unless another size is mentioned. If asked "how full is this truck?", ask for the truck's size before giving a fraction. Respond only with estimated volume — never include pricing or unrelated commentary.;

app.post('/api/chat', async (req, res) => { try { const { message, images } = req.body;

const messages = [
  { role: 'system', content: systemPrompt }
];

if (images && images.length > 0) {
  messages.push({
    role: 'user',
    content: [
      { type: 'text', text: message || 'Attached image for estimate.' },
      {
        type: 'image_url',
        image_url: { url: images[0] }
      }
    ]
  });
} else {
  messages.push({ role: 'user', content: message });
}

const completion = await openai.chat.completions.create({
  model: 'gpt-4-vision-preview',
  messages
});

const reply = completion.choices[0].message.content.trim();
res.json({ reply });

} catch (err) { console.error('[GPT ERROR]', err); res.status(500).json({ reply: Error: ${err.message || 'Unknown error'} }); } });

const PORT = process.env.PORT || 3000; app.listen(PORT, () => { console.log(✅ Server running at http://localhost:${PORT}); });

