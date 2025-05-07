// public/script.js

const chat = document.getElementById('chat'); const textarea = document.getElementById('message'); const sendBtn = document.getElementById('send'); let originalImageBase64 = '';

function appendMessage(role, text) { const msg = document.createElement('div'); msg.className = 'mb-2'; msg.innerHTML = <strong>${role}:</strong> ${text}; chat.appendChild(msg); chat.scrollTop = chat.scrollHeight; }

function getAnnotatedImageBase64() { return stage ? stage.toDataURL({ pixelRatio: 2 }) : ''; }

sendBtn.addEventListener('click', async () => { let message = textarea.value.trim(); if (!message && !originalImageBase64) return;

const lower = message.toLowerCase();

// Normalize varied phrases if (lower.includes("how full") && lower.includes("truck")) { message = "Can you estimate how full this truck is?"; } else if (lower.includes("how many yards") || lower.includes("yardage")) { message = "Can you estimate how many cubic yards are shown?"; } else if (lower.includes("how much debris") || lower.includes("volume") || lower.includes("how big is this")) { message = "Can you estimate the junk volume in cubic yards?"; } else if (lower.includes("how many items") || lower.includes("item count")) { message = "Can you count the number of items?"; }

appendMessage('You', message || '[Image only]'); textarea.value = '';

try { const response = await fetch('https://jiffy-junk-volume-bot.onrender.com/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, images: [originalImageBase64] // Send raw uploaded image only for better accuracy }) });

const data = await response.json();
appendMessage('Assistant', data.reply);

} catch (err) { appendMessage('Assistant', 'Error: Could not connect to server'); } });

// Handle image upload and drawing let stage, layer, imageObj; let annotations = [];

document.getElementById('image-upload').addEventListener('change', function (e) { const reader = new FileReader(); reader.onload = function () { originalImageBase64 = reader.result; // Save original image const container = document.getElementById('canvas-container'); container.innerHTML = '';

imageObj = new Image();
imageObj.onload = function () {
  stage = new Konva.Stage({
    container: 'canvas-container',
    width: imageObj.width,
    height: imageObj.height
  });

  window.stage = stage;
  layer = new Konva.Layer();
  const konvaImage = new Konva.Image({
    image: imageObj,
    x: 0,
    y: 0
  });

  layer.add(konvaImage);
  stage.add(layer);

  annotations = []; // reset

  let isDrawing = false;
  let currentLine;

  stage.on('mousedown touchstart', () => {
    isDrawing = true;
    const pos = stage.getPointerPosition();
    currentLine = new Konva.Line({
      stroke: 'red',
      strokeWidth: 3,
      globalCompositeOperation: 'source-over',
      points: [pos.x, pos.y]
    });
    layer.add(currentLine);
    annotations.push(currentLine);
  });

  stage.on('mousemove touchmove', () => {
    if (!isDrawing) return;
    const pos = stage.getPointerPosition();
    const newPoints = currentLine.points().concat([pos.x, pos.y]);
    currentLine.points(newPoints);
    layer.batchDraw();
  });

  stage.on('mouseup touchend', () => {
    isDrawing = false;
  });
};
imageObj.src = reader.result;

}; reader.readAsDataURL(e.target.files[0]); });

document.getElementById('undo-button').addEventListener('click', () => { const lastLine = annotations.pop(); if (lastLine) { lastLine.destroy(); layer.draw(); } });

