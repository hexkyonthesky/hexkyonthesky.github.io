const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

/* 🔒 INTERNAL RESOLUTION FIX */
const BASE_WIDTH = 1080;
const BASE_HEIGHT = 1080;

canvas.width = BASE_WIDTH;
canvas.height = BASE_HEIGHT;

let bgImage = null;
let scaleMode = "fit";

let fontSize = 18;
let bold = false;
let currentColor = "#ffffff";

let texts = [];
let redoStack = [];

/* CURSOR RELATIF (0–1) */
let cursorX = 0.05;
let cursorY = 0.08;
const lineGap = 0.035;
const colGap = 0.04;

function draw() {
  ctx.clearRect(0,0,BASE_WIDTH,BASE_HEIGHT);

  if (bgImage) drawImage();

  texts.forEach(t => {
    ctx.font = `${t.bold ? "bold" : ""} ${t.size}px Arial`;
    ctx.fillStyle = t.color;
    ctx.fillText(
      t.text,
      t.x * BASE_WIDTH,
      t.y * BASE_HEIGHT
    );
  });
}

function drawImage() {
  let sw = bgImage.width;
  let sh = bgImage.height;
  let sx = 0, sy = 0;

  const imgRatio = sw / sh;
  const canvasRatio = BASE_WIDTH / BASE_HEIGHT;

  if (scaleMode === "crop") {
    if (imgRatio > canvasRatio) {
      sw = sh * canvasRatio;
      sx = (bgImage.width - sw) / 2;
    } else {
      sh = sw / canvasRatio;
      sy = (bgImage.height - sh) / 2;
    }
  }

  ctx.drawImage(bgImage, sx, sy, sw, sh, 0, 0, BASE_WIDTH, BASE_HEIGHT);

  cursorX = 0.05;
  cursorY = 0.08;
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

  if (cursorY > 0.95) {
    cursorY = 0.08;
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
    draw();
    addTextBtn.disabled = false;
  };
  img.src = URL.createObjectURL(e.target.files[0]);
};

addTextBtn.onclick = addText;

undoBtn.onclick = () => { if(texts.length) redoStack.push(texts.pop()); draw(); };
redoBtn.onclick = () => { if(redoStack.length) texts.push(redoStack.pop()); draw(); };

fsUpBtn.onclick = () => { fontSize++; fontSizeLabel.textContent = fontSize };
fsDownBtn.onclick = () => { fontSize--; fontSizeLabel.textContent = fontSize };

boldBtn.onclick = () => bold = !bold;
whiteBtn.onclick = () => currentColor = "#ffffff";
purpleBtn.onclick = () => currentColor = "#c084ff";

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
