const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 900;
canvas.height = 500;

let fontSize = 18;
let items = [];
let redoStack = [];
let bg = null;

function render() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(bg) ctx.drawImage(bg,0,0,canvas.width,canvas.height);
  items.forEach(i=>{
    ctx.font = `${i.size}px Arial`;
    ctx.fillStyle = "#fff";
    ctx.fillText(i.text,i.x,i.y);
  });
}

function addText() {
  const t = textInput.value;
  if(!t) return;
  items.push({text:t,size:fontSize,x:20,y:40+items.length*26});
  redoStack=[];
  render();
}

addText.onclick = addText;
undo.onclick = ()=>{ if(items.length) redoStack.push(items.pop()); render(); }
redo.onclick = ()=>{ if(redoStack.length) items.push(redoStack.pop()); render(); }
fsUp.onclick = ()=>{fontSize++;};
fsDown.onclick = ()=>{fontSize--;};

pickImage.onclick = ()=>imageInput.click();
imageInput.onchange = e=>{
  const img = new Image();
  img.onload=()=>{bg=img;render();}
  img.src=URL.createObjectURL(e.target.files[0]);
};

download.onclick = ()=>{
  const a=document.createElement('a');
  a.href=canvas.toDataURL();
  a.download="ssrp.png";
  a.click();
};

render();
