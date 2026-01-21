const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.6;

let fontSize = 17;
let actions = [];
let redoStack = [];
let bgImage = null;

// DRAW CANVAS
function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (bgImage) ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  actions.forEach(act => {
    ctx.font = `${act.size}px sans-serif`;
    ctx.fillStyle = "#fff";
    ctx.fillText(act.text, act.x, act.y);
  });
}

// ADD TEXT
function addText() {
  const textInput = document.getElementById('textInput').value;
  if (!textInput) return alert("Isi teks dulu!");
  const action = { text: textInput, size: fontSize, x: 50, y: 50 + actions.length * 30 };
  actions.push(action);
  redoStack = [];
  drawCanvas();
}

// UNDO / REDO
function undoAction() {
  if (actions.length > 0) {
    redoStack.push(actions.pop());
    drawCanvas();
  }
}

function redoAction() {
  if (redoStack.length > 0) {
    actions.push(redoStack.pop());
    drawCanvas();
  }
}

// FONT SIZE
function changeFontSize(delta) {
  fontSize += delta;
  if (fontSize < 5) fontSize = 5;
  document.getElementById('fontSizeLabel').innerText = fontSize;
}

// PICK IMAGE
document.getElementById('imageInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    const img = new Image();
    img.onload = () => { bgImage = img; drawCanvas(); };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

// DOWNLOAD
function downloadImage() {
  const link = document.createElement('a');
  link.download = 'ssrp_image.png';
  link.href = canvas.toDataURL();
  link.click();
}

// UPLOAD TO IMGUR
function uploadToImgur() {
  const clientId = 'YOUR_CLIENT_ID'; // ganti dengan client id Imgur-mu
  canvas.toBlob(blob => {
    const form = new FormData();
    form.append('image', blob);
    fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: { Authorization: 'Client-ID ' + clientId },
      body: form
    })
    .then(res => res.json())
    .then(data => {
      if(data.success){
        document.getElementById('imgurLinkContainer').style.display = 'block';
        document.getElementById('imgurLinkInput').value = data.data.link;
      } else alert('Upload gagal');
    }).catch(err => alert('Error: ' + err));
  });
}

// COPY & CLOSE LINK
function copyImgurLink() {
  const input = document.getElementById('imgurLinkInput');
  input.select();
  document.execCommand('copy');
  alert('Link copied!');
}

function closeImgurLink() {
  document.getElementById('imgurLinkContainer').style.display = 'none';
}

// EVENT LISTENERS
document.getElementById('addTextBtn').addEventListener('click', addText);
document.getElementById('undoBtn').addEventListener('click', undoAction);
document.getElementById('redoBtn').addEventListener('click', redoAction);
document.getElementById('increaseFont').addEventListener('click', () => changeFontSize(1));
document.getElementById('decreaseFont').addEventListener('click', () => changeFontSize(-1));
document.getElementById('saveBtn').addEventListener('click', downloadImage);
document.getElementById('uploadImgurBtn').addEventListener('click', uploadToImgur);
document.getElementById('pickImageBtn').addEventListener('click', () => document.getElementById('imageInput').click());
document.getElementById('copyLinkBtn').addEventListener('click', copyImgurLink);
document.getElementById('closeLinkBtn').addEventListener('click', closeImgurLink);

drawCanvas();
