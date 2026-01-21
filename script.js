const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

/* 🔒 CANVAS ASLI */
const SIZE = 1080;
canvas.width = SIZE;
canvas.height = SIZE;

let bgImage = null;
let scaleMode = "fit";

let fontSize = 18;
let bold = false;
let currentColor = "#ffffff";

let texts = [];
let redoStack = [];

let cursorX = 40;
let cursorY = 80;
const lineGap = 30;
const colGap = 260;

function draw() {
  ctx.clearRect(0,0,SIZE,SIZE);

  if (bgImage) drawImage();

  texts.forEach(t => {
    ctx.font = `${t.bold ? "bold" : ""} ${t.size}px Arial`;
    ctx.fillStyle = t.color;
    ctx.fillText(t.text, t.x, t.y);
  });
}

function drawImage() {
  let sx = 0, sy = 0;
  let sw = bgImage.width;
  let sh = bgImage.height;

  const imgRatio = sw / sh;

  if (scaleMode === "crop") {
    if (imgRatio > 1) {
      sw = sh;
      sx = (bgImage.width - sw) / 2;
    } else {
      sh = sw;
      sy = (bgImage.height - sh) / 2;
    }
  }

  ctx.drawImage(bgImage, sx, sy, sw, sh, 0, 0, SIZE, SIZE);

  cursorX = 40;
  cursorY = 80;
}

function addText() {
  const value = textInput.value.trim();
  if (!value) return;

  texts.push({
    text: value,
    size: fontSize,
    color: currentColor,
    bold,
    x: cursorX,
    y: cursorY
  });

  cursorY += lineGap;

  if (cursorY > SIZE - 60) {
    cursorY = 80;
    cursorX += colGap;
  }

  draw();
}

/* EVENTS */
uploadBtn.onclick = () => imageInput.click();

imageInput.onchange = e => {
  const img = new Image();
  img.onload = () => {
    bgImage = img;
    texts = [];
    redoStack = [];
    draw();
    addTextBtn.disabled = false;
  };
  img.src = URL.createObjectURL(e.target.files[0]);
};

addTextBtn.onclick = addText;

undoBtn.onclick = () => {
  if (texts.length) redoStack.push(texts.pop());
  draw();
};

redoBtn.onclick = () => {
  if (redoStack.length) texts.push(redoStack.pop());
  draw();
};

fsUpBtn.onclick = () => { fontSize++; fontSizeLabel.textContent = fontSize };
fsDownBtn.onclick = () => { fontSize--; fontSizeLabel.textContent = fontSize };

boldBtn.onclick = () => bold = !bold;
whiteBtn.onclick = () => currentColor = "#ffffff";
purpleBtn.onclick = () => currentColor = "#8b5cff";

scalePreset.onchange = e => {
  scaleMode = e.target.value;
  draw();
};

saveBtn.onclick = () => {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "ssrp.png";
  a.click();
};
