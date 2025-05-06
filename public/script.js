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
  return window.stage ? window.stage.toDataURL({ pixelRatio: 2 }) : '';
}

sendBtn.addEventListener('click', async () => {
  const message = textarea.value.trim();
  const imageData = getAnnotatedImageBase64();

  if (!message && !imageData) return;

  appendMessage('You', message || '[Image only]');
  textarea.value = '';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, images: [imageData] })
    });

    const data = await response.json();
    appendMessage('Assistant', data.reply);
  } catch (err) {
    appendMessage('Assistant', 'Error: Could not connect to server');
  }
});
