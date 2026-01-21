const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const addBtn = document.getElementById("addTextBtn");
const textInput = document.getElementById("textInput");

let bgImage = null;
let imgArea = null;
let cropCenter = false;

let fontSize = 18;
let currentColor = "#ffffff";

let texts = [];
let redoStack = [];

let cursorX = 0;
let cursorY = 0;
const lineGap = 26;
const colGap = 30;

function resizeCanvas() {
  canvas.width = Math.min(1100, window.innerWidth * 0.92);
  canvas.height = Math.min(650, window.innerHeight * 0.75);
  draw();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (bgImage && imgArea) {
    ctx.drawImage(bgImage, imgArea.sx, imgArea.sy, imgArea.sw, imgArea.sh,
      imgArea.x, imgArea.y, imgArea.w, imgArea.h);
  }

  texts.forEach(t => {
    ctx.font = `${t.size}px Arial`;
    ctx.fillStyle = t.color;
    ctx.fillText(t.text, t.x, t.y);
  });
}

function setupImage(img) {
  const canvasRatio = canvas.width / canvas.height;
  const imgRatio = img.width / img.height;

  let sx = 0, sy = 0, sw = img.width, sh = img.height;

  if (cropCenter) {
    if (imgRatio > canvasRatio) {
      sw = img.height * canvasRatio;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / canvasRatio;
      sy = (img.height - sh) / 2;
    }
  }

  const scale = Math.min(canvas.width / sw, canvas.height / sh);
  const w = sw * scale;
  const h = sh * scale;
  const x = (canvas.width - w) / 2;
  const y = (canvas.height - h) / 2;

  imgArea = { x, y, w, h, sx, sy, sw, sh };

  cursorX = x + 20;
  cursorY = y + 30;
}

function addText() {
  if (!bgImage || !imgArea) return;

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
    color: currentColor,
    x: cursorX,
    y: cursorY
  });

  cursorY += lineGap;
  redoStack = [];
  draw();
}

/* EVENTS */
document.getElementById("uploadBtn").onclick = () =>
  document.getElementById("imageInput").click();

document.getElementById("imageInput").onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    bgImage = img;
    texts = [];
    redoStack = [];
    setupImage(img);
    addBtn.disabled = false;
    draw();
  };
  img.src = URL.createObjectURL(file);
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

document.getElementById("whiteBtn").onclick = () => currentColor = "#ffffff";
document.getElementById("purpleBtn").onclick = () => currentColor = "#c77dff";

document.getElementById("cropToggle").onchange = e => {
  cropCenter = e.target.checked;
  if (bgImage) {
    setupImage(bgImage);
    draw();
  }
};

document.getElementById("saveBtn").onclick = () => {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "ssrp.png";
  a.click();
};
