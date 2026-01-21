export default {
  async fetch(req) {
    const form = await req.formData();
    const res = await fetch("https://api.imgur.com/3/image", {
      method:"POST",
      headers:{ Authorization:"Client-ID YOUR_CLIENT_ID" },
      body:form
    });
    return new Response(await res.text(),{headers:{'Content-Type':'application/json'}});
  }
}
