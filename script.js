const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const addBtn = document.getElementById("addTextBtn");

let bgImage = null;
let fontSize = 18;
let texts = [];
let redoStack = [];

let imgArea = null;
let cursorX = 0;
let cursorY = 0;
const lineGap = 26;
const colGap = 30;

function resizeCanvas() {
  canvas.width = Math.min(1000, window.innerWidth * 0.9);
  canvas.height = Math.min(600, window.innerHeight * 0.7);
  draw();
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if (bgImage) {
    const scale = Math.min(
      canvas.width / bgImage.width,
      canvas.height / bgImage.height
    );

    const w = bgImage.width * scale;
    const h = bgImage.height * scale;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;

    ctx.drawImage(bgImage, x, y, w, h);

    imgArea = { x, y, w, h };
  }

  texts.forEach(t => {
    ctx.font = `${t.size}px Arial`;
    ctx.fillStyle = "#fff";
    ctx.fillText(t.text, t.x, t.y);
  });
}

function resetCursor() {
  cursorX = imgArea.x + 20;
  cursorY = imgArea.y + 30;
}

function addText() {
  if (!bgImage) return;

  const value = textInput.value.trim();
  if (!value) return;

  ctx.font = `${fontSize}px Arial`;
  const textWidth = ctx.measureText(value).width;

  if (cursorY + lineGap > imgArea.y + imgArea.h - 10) {
    cursorY = imgArea.y + 30;
    cursorX += textWidth + colGap;
  }

  if (cursorX + textWidth > imgArea.x + imgArea.w - 10) {
    alert("Text area full");
    return;
  }

  texts.push({
    text: value,
    size: fontSize,
    x: cursorX,
    y: cursorY
  });

  cursorY += lineGap;
  redoStack = [];
  draw();
}

document.getElementById("uploadBtn").onclick = () => imageInput.click();

imageInput.onchange = e => {
  const img = new Image();
  img.onload = () => {
    bgImage = img;
    texts = [];
    redoStack = [];
    addBtn.disabled = false;
    resetCursor();
    draw();
  };
  img.src = URL.createObjectURL(e.target.files[0]);
};

addBtn.onclick = addText;

document.getElementById("undoBtn").onclick = () => {
  if (texts.length) redoStack.push(texts.pop());
  draw();
};

document.getElementById("redoBtn").onclick = () => {
  if (redoStack.length) texts.push(redoStack.pop());
  draw();
};

document.getElementById("fsUpBtn").onclick = () => {
  fontSize++;
  fontSizeLabel.textContent = fontSize;
};

document.getElementById("fsDownBtn").onclick = () => {
  fontSize = Math.max(6, fontSize - 1);
  fontSizeLabel.textContent = fontSize;
};

document.getElementById("saveBtn").onclick = () => {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "hexky_ssrp.png";
  a.click();
};
