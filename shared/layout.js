document.addEventListener("DOMContentLoaded", async () => {
  const headerEl = document.getElementById("appHeader");
  const footerEl = document.getElementById("appFooter");

  if (headerEl) {
    try {
      const res = await fetch("/shared/header.html");
      if (res.ok) {
        headerEl.innerHTML = await res.text();
      } else {
        console.error("Failed to load header: ", res.status);
      }
    } catch (e) {
      console.error("Failed to load header", e);
    }
  }

  if (footerEl) {
    try {
      const res = await fetch("/shared/footer.html");
      if (res.ok) {
        footerEl.innerHTML = await res.text();
      } else {
        console.error("Failed to load footer: ", res.status);
      }
    } catch (e) {
      console.error("Failed to load footer", e);
    }
  }
});
