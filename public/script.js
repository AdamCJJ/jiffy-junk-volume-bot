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
  let message = textarea.value.trim();
  if (!message && !stage) return;

  const lower = message.toLowerCase();

  // Phrase normalization
  if (lower.includes("how full") && lower.includes("truck")) {
    message = "Can you estimate how full this truck is?";
  } else if (lower.includes("how many yards") || lower.includes("yardage")) {
    message = "Can you estimate how many cubic yards are shown?";
  } else if (lower.includes("how much debris") || lower.includes("volume") || lower.includes("how big is this")) {
    message = "Can you estimate the junk volume in cubic yards?";
  } else if (lower.includes("how many items") || lower.includes("item count")) {
    message = "Can you count the number of items?";
  }

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
