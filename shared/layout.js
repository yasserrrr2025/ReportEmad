document.addEventListener('DOMContentLoaded', async () => {
  const headerEl = document.getElementById('appHeader');
  const footerEl = document.getElementById('appFooter');

  if (headerEl) {
    try {
      const res = await fetch('/shared/header.html');
      headerEl.innerHTML = await res.text();
    } catch (e) {
      console.error('Failed to load header', e);
    }
  }

  if (footerEl) {
    try {
      const res = await fetch('/shared/footer.html');
      footerEl.innerHTML = await res.text();
    } catch (e) {
      console.error('Failed to load footer', e);
    }
  }
});
