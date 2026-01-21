const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let bgImage = null;
let fontSize = 18;
let texts = [];
let redoStack = [];

// text layout system
let startX = 20;
let startY = 40;
let lineHeight = 26;
let columnGap = 40;
let currentX, currentY;
let maxTextWidth, maxTextHeight;

function resizeCanvas() {
  canvas.width = Math.min(1000, window.innerWidth * 0.9);
  canvas.height = Math.min(600, window.innerHeight * 0.7);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

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

    maxTextWidth = w - 40;
    maxTextHeight = h - 40;
    startX = x + 20;
    startY = y + 30;
  }

  texts.forEach(t => {
    ctx.font = `${t.size}px Arial`;
    ctx.fillStyle = "#fff";
    ctx.fillText(t.text, t.x, t.y);
  });
}

function addText() {
  if (!bgImage) {
    alert("Upload image first!");
    return;
  }

  const value = textInput.value.trim();
  if (!value) return;

  ctx.font = `${fontSize}px Arial`;
  const textWidth = ctx.measureText(value).width;

  if (!currentX) {
    currentX = startX;
    currentY = startY;
  }

  if (currentY + lineHeight > startY + maxTextHeight) {
    currentX += textWidth + columnGap;
    currentY = startY;
  }

  if (currentX + textWidth > startX + maxTextWidth) {
    alert("Text area full!");
    return;
  }

  texts.push({
    text: value,
    size: fontSize,
    x: currentX,
    y: currentY
  });

  currentY += lineHeight;
  redoStack = [];
  draw();
}

// controls
addTextBtn.onclick = addText;
undoBtn.onclick = () => { if(texts.length) redoStack.push(texts.pop()); draw(); };
redoBtn.onclick = () => { if(redoStack.length) texts.push(redoStack.pop()); draw(); };
fsUpBtn.onclick = () => { fontSize++; fontSizeLabel.textContent = fontSize; };
fsDownBtn.onclick = () => { fontSize=Math.max(6,fontSize-1); fontSizeLabel.textContent=fontSize; };

pickImageBtn.onclick = () => imageInput.click();

imageInput.onchange = e => {
  const img = new Image();
  img.onload = () => {
    bgImage = img;
    texts = [];
    currentX = null;
    draw();
  };
  img.src = URL.createObjectURL(e.target.files[0]);
};

downloadBtn.onclick = () => {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "ssrp_pro.png";
  a.click();
};

draw();
