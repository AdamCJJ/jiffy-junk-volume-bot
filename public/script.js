// script.js (client side)
const chat = document.getElementById('chat');
const textarea = document.getElementById('message');
const sendBtn = document.getElementById('send');

function appendMessage(role, text) {
  const msg = document.createElement('div');
  msg.className = 'mb-2';
  msg.innerHTML = `<strong>${role}:</strong> ${text}`;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function getAnnotatedImageBase64() {
  return stage ? stage.toDataURL({ pixelRatio: 2 }) : '';
}

sendBtn.addEventListener('click', async () => {
  const message = textarea.value.trim();
  if (!message && !stage) return;

  appendMessage('You', message || '[Image only]');
  textarea.value = '';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        images: [getAnnotatedImageBase64()]
      })
    });

    const data = await response.json();
    appendMessage('Assistant', data.reply);
  } catch (err) {
    appendMessage('Assistant', 'Error: Could not connect to server');
  }
});
