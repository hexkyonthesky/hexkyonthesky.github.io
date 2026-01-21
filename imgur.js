async function upload() {
  const blob = await new Promise(r=>canvas.toBlob(r));
  const form = new FormData();
  form.append("image", blob);

  const res = await fetch("https://YOUR-WORKER-URL", {
    method: "POST",
    body: form
  });

  const data = await res.json();
  result.hidden=false;
  resultLink.value=data.link;
}

uploadBtn = upload;
