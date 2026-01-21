// ===== Canvas Setup =====
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = Math.min(900, window.innerWidth * 0.7);
canvas.height = Math.min(500, window.innerHeight * 0.6);

let fontSize = 18;
let items = [];
let redoStack = [];
let bgImage = null;

// ===== Draw Canvas =====
function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (bgImage) ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

  items.forEach((item, idx) => {
    ctx.font = `${item.size}px Arial`;
    ctx.fillStyle = "#fff";
    ctx.fillText(item.text, item.x, item.y);
  });
}

// ===== Add Text =====
function addText() {
  const text = document.getElementById('textInput').value.trim();
  if (!text) return alert("Isi teks dulu!");
  const newItem = { text: text, size: fontSize, x: 20, y: 40 + items.length * 26 };
  items.push(newItem);
  redoStack = [];
  drawCanvas();
}

// ===== Undo / Redo =====
function undo() {
  if (items.length) redoStack.push(items.pop());
  drawCanvas();
}

function redo() {
  if (redoStack.length) items.push(redoStack.pop());
  drawCanvas();
}

// ===== Font Size =====
function increaseFont() {
  fontSize++;
  document.getElementById('fontSizeLabel').innerText = fontSize;
}

function decreaseFont() {
  fontSize--;
  if (fontSize < 5) fontSize = 5;
  document.getElementById('fontSizeLabel').innerText = fontSize;
}

// ===== Background Image =====
const imageInput = document.getElementById('imageInput');

function pickImage() {
  imageInput.click();
}

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => { bgImage = img; drawCanvas(); }
  img.src = URL.createObjectURL(file);
});

// ===== Download =====
function download() {
  const link = document.createElement('a');
  link.download = "ssrp_image.png";
  link.href = canvas.toDataURL();
  link.click();
}

// ===== Event Listeners =====
document.getElementById('addTextBtn').addEventListener('click', addText);
document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('redoBtn').addEventListener('click', redo);
document.getElementById('fsUpBtn').addEventListener('click', increaseFont);
document.getElementById('fsDownBtn').addEventListener('click', decreaseFont);
document.getElementById('pickImageBtn').addEventListener('click', pickImage);
document.getElementById('downloadBtn').addEventListener('click', download);

// ===== Initial Draw =====
drawCanvas();
