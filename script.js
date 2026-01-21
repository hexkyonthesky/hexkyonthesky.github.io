const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = Math.min(900, window.innerWidth * 0.9);
  canvas.height = Math.min(500, window.innerHeight * 0.65);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let fontSize = 18;
let texts = [];
let redoStack = [];
let bgImage = null;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

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
  }

  texts.forEach(t => {
    ctx.font = `${t.size}px Arial`;
    ctx.fillStyle = "#fff";
    ctx.fillText(t.text, t.x, t.y);
  });
}

function addText() {
  const value = textInput.value.trim();
  if (!value) return;

  texts.push({
    text: value,
    size: fontSize,
    x: 20,
    y: 40 + texts.length * 26
  });

  redoStack = [];
  draw();
}

function undo() {
  if (texts.length) redoStack.push(texts.pop());
  draw();
}

function redo() {
  if (redoStack.length) texts.push(redoStack.pop());
  draw();
}

function fontUp() {
  fontSize++;
  fontSizeLabel.textContent = fontSize;
}

function fontDown() {
  fontSize = Math.max(5, fontSize - 1);
  fontSizeLabel.textContent = fontSize;
}

imageInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    bgImage = img;
    draw();
  };
  img.src = URL.createObjectURL(file);
});

pickImageBtn.onclick = () => imageInput.click();
addTextBtn.onclick = addText;
undoBtn.onclick = undo;
redoBtn.onclick = redo;
fsUpBtn.onclick = fontUp;
fsDownBtn.onclick = fontDown;
downloadBtn.onclick = () => {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "ssrp.png";
  a.click();
};

draw();
