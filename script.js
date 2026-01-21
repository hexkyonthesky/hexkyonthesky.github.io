const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1280;
canvas.height = 720;

let bgImage = null;
let imgArea = null;
let scaleMode = "fit";

let fontSize = 18;
let bold = false;
let currentColor = "#ffffff";

let texts = [];
let redoStack = [];
let cursorX = 0;
let cursorY = 0;
const lineGap = 26;
const colGap = 30;

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if (bgImage) {
    drawImage();
  }

  texts.forEach(t => {
    ctx.font = `${t.bold ? "bold" : ""} ${t.size}px Arial`;
    ctx.fillStyle = t.color;
    ctx.fillText(t.text, t.x, t.y);
  });
}

function drawImage() {
  let sx=0, sy=0, sw=bgImage.width, sh=bgImage.height;
  let dw=canvas.width, dh=canvas.height;

  const imgRatio = bgImage.width / bgImage.height;
  const canvasRatio = canvas.width / canvas.height;

  if (scaleMode === "fit") {
    const scale = Math.min(dw / sw, dh / sh);
    dw = sw * scale;
    dh = sh * scale;
  }

  if (scaleMode === "fill") {
    const scale = Math.max(dw / sw, dh / sh);
    dw = sw * scale;
    dh = sh * scale;
  }

  if (scaleMode === "crop") {
    if (imgRatio > canvasRatio) {
      sw = bgImage.height * canvasRatio;
      sx = (bgImage.width - sw) / 2;
    } else {
      sh = bgImage.width / canvasRatio;
      sy = (bgImage.height - sh) / 2;
    }
  }

  const dx = (canvas.width - dw) / 2;
  const dy = (canvas.height - dh) / 2;

  ctx.drawImage(bgImage, sx, sy, sw, sh, dx, dy, dw, dh);

  cursorX = dx + 20;
  cursorY = dy + 30;
}

function addText() {
  const value = textInput.value.trim();
  if (!value) return;

  ctx.font = `${bold ? "bold" : ""} ${fontSize}px Arial`;
  const w = ctx.measureText(value).width;

  if (cursorY + lineGap > canvas.height - 20) {
    cursorY = 30;
    cursorX += w + colGap;
  }

  texts.push({
    text: value,
    size: fontSize,
    color: currentColor,
    bold
  });

  texts[texts.length - 1].x = cursorX;
  texts[texts.length - 1].y = cursorY;

  cursorY += lineGap;
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
