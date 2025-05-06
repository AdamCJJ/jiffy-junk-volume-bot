sendBtn.addEventListener('click', async () => {
  let message = textarea.value.trim();
  if (!message && !stage) return;

  // Normalize phrasing
  const lower = message.toLowerCase();
  if (lower.includes("how full is this truck")) {
    message = "Can you estimate how full this truck is?";
  } else if (lower.includes("how many yards")) {
    message = "Can you estimate how many cubic yards are shown?";
  } else if (lower.includes("how much debris") || lower.includes("volume")) {
    message = "Can you estimate the junk volume in cubic yards?";
  } else if (lower.includes("how many items")) {
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
