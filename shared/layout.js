document.addEventListener('DOMContentLoaded', async () => {
  const headerEl = document.getElementById('appHeader');
  const footerEl = document.getElementById('appFooter');

  // Determine base path based on current URL
  const isRoot = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html');
  const basePath = isRoot ? './shared/' : '../shared/';

  if (headerEl) {
    try {
      const res = await fetch(basePath + 'header.html');
      headerEl.innerHTML = await res.text();
    } catch (e) {
      console.error('Failed to load header', e);
    }
  }

  if (footerEl) {
    try {
      const res = await fetch(basePath + 'footer.html');
      footerEl.innerHTML = await res.text();
    } catch (e) {
      console.error('Failed to load footer', e);
    }
  }
});
