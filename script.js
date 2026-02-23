const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let image = new Image();
let imagePos = { x: 0, y: 0, dragging: false, dragOffset: { x: 0, y: 0 } };
let imageLoaded = false;
let imageDrawSize = { width: 0, height: 0 };

let texts = [];
let undoStack = [];
let redoStack = [];
let fontSize = 17;
let lineHeight = fontSize * 1.2;

window.addEventListener('load', () => {
  canvas.width = 800;
  canvas.height = 600;
  drawCanvas();
});

function saveState() {
  undoStack.push(JSON.parse(JSON.stringify(texts)));
  redoStack = [];
}

document.getElementById('imageInput').addEventListener('change', (e) => {
  handleImageUpload(e.target.files[0]);
});

canvas.addEventListener('click', () => {
  if (!imageLoaded) {
    document.getElementById('imageInput').click();
  }
});

function handleImageUpload(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    image.onload = () => {
      imageLoaded = true;

      const canvasRatio = 4 / 3;
      const imgRatio = image.width / image.height;

      if (imgRatio > canvasRatio) {
        imageDrawSize.height = canvas.height;
        imageDrawSize.width = canvas.height * imgRatio;
      } else {
        imageDrawSize.width = canvas.width;
        imageDrawSize.height = canvas.width / imgRatio;
      }

      imagePos.x = (canvas.width - imageDrawSize.width) / 2;
      imagePos.y = (canvas.height - imageDrawSize.height) / 2;

      drawCanvas();
    };
    image.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

/* ============================================================
   COLOR TAG PARSER
   Format: {rrggbb} atau {rgb} di dalam teks
   Contoh: "Halo {ff0000}merah {00ff00}hijau {ffffff}putih"
   ============================================================ */

/**
 * Pecah teks menjadi segmen-segmen { text, color }
 * berdasarkan tag warna {hex}.
 */
function parseColorSegments(text, defaultColor) {
  const colorTagRegex = /\{([0-9a-fA-F]{3,8})\}/g;
  const segments = [];
  let lastIndex = 0;
  let currentColor = defaultColor;
  let match;

  while ((match = colorTagRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), color: currentColor });
    }
    currentColor = '#' + match[1];
    lastIndex = colorTagRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), color: currentColor });
  }

  // Kalau tidak ada tag sama sekali
  if (segments.length === 0) {
    segments.push({ text, color: defaultColor });
  }

  return segments;
}

/**
 * Gambar teks multicolor ke canvas.
 * Kembalikan lebar total teks yang digambar.
 */
function drawColoredText(ctx, text, x, y, defaultColor) {
  const segments = parseColorSegments(text, defaultColor);
  let cursorX = x;

  for (const seg of segments) {
    // Stroke (outline hitam) dulu
    ctx.strokeStyle = 'black';
    ctx.strokeText(seg.text, cursorX, y);
    // Fill warna
    ctx.fillStyle = seg.color;
    ctx.fillText(seg.text, cursorX, y);

    cursorX += ctx.measureText(seg.text).width;
  }

  return cursorX - x;
}

/**
 * Ukur lebar teks tanpa tag warna (untuk keperluan layout).
 */
function measurePlainText(ctx, text) {
  const stripped = text.replace(/\{[0-9a-fA-F]{3,8}\}/g, '');
  return ctx.measureText(stripped).width;
}

/* ============================================================ */

function drawCanvas() {
  ctx.fillStyle = "#12121c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!imageLoaded) {
    ctx.font = '18px Inter';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Click to select an image', canvas.width / 2, canvas.height / 2);
    ctx.textAlign = 'left';
  } else {
    ctx.drawImage(image, imagePos.x, imagePos.y, imageDrawSize.width, imageDrawSize.height);
  }

  ctx.font = `bold ${fontSize}px Inter`;
  ctx.lineWidth = 2;

  texts.forEach((textObj) => {
    const isActionText = textObj.text.startsWith("*");
    // Warna default: ungu untuk *action, putih untuk dialog
    const defaultColor = isActionText ? "#cfa8ff" : "#ffffff";

    ctx.shadowColor = "black";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    textObj.text.split('\n').forEach((line, i) => {
      drawColoredText(ctx, line, textObj.x, textObj.y + (i * lineHeight), defaultColor);
    });

    ctx.shadowColor = "transparent";
  });
}

function addText() {
  const textInput = document.getElementById('textInput').value.trim();
  if (!textInput) return;

  saveState();

  texts.push({
    text: textInput,
    x: 50,
    y: 50 + texts.reduce((acc, curr) => acc + curr.text.split('\n').length, 0) * lineHeight
  });

  document.getElementById('textInput').value = '';
  drawCanvas();
}

function undoAction() {
  if (undoStack.length > 0) {
    redoStack.push(JSON.parse(JSON.stringify(texts)));
    texts = undoStack.pop();
    drawCanvas();
  }
}

function redoAction() {
  if (redoStack.length > 0) {
    undoStack.push(JSON.parse(JSON.stringify(texts)));
    texts = redoStack.pop();
    drawCanvas();
  }
}

function changeFontSize(delta) {
  fontSize = Math.max(12, Math.min(30, fontSize + delta));
  lineHeight = fontSize * 1.2;
  document.getElementById('fontSizeLabel').textContent = fontSize;
  drawCanvas();
}

function downloadImage() {
  drawCanvas();
  const link = document.createElement('a');
  link.download = 'ssrp-image.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/* === DRAG IMAGE (HORIZONTAL ONLY) === */
canvas.addEventListener('mousedown', (e) => {
  if (!imageLoaded) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (
    x >= imagePos.x &&
    x <= imagePos.x + imageDrawSize.width &&
    y >= imagePos.y &&
    y <= imagePos.y + imageDrawSize.height
  ) {
    imagePos.dragging = true;
    imagePos.dragOffset.x = x - imagePos.x;
    canvas.style.cursor = 'grabbing';
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!imageLoaded || !imagePos.dragging) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;

  let newX = x - imagePos.dragOffset.x;
  newX = Math.min(0, Math.max(canvas.width - imageDrawSize.width, newX));

  imagePos.x = newX;
  drawCanvas();
});

canvas.addEventListener('mouseup', () => {
  imagePos.dragging = false;
  canvas.style.cursor = 'grab';
});

canvas.addEventListener('mouseleave', () => {
  imagePos.dragging = false;
  canvas.style.cursor = 'grab';
});

/* === ENTER KEY === */
document.getElementById('textInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addText();
  }
});
