document.addEventListener('DOMContentLoaded', async () => {
  const headerEl = document.getElementById('appHeader');
  const footerEl = document.getElementById('appFooter');

  // Determine base path based on current URL
  const path = window.location.pathname;
  const isPagesDir = path.includes('/pages/');
  const basePath = isPagesDir ? '../shared/' : './shared/';

  if (headerEl) {
    try {
      const res = await fetch(basePath + 'header.html');
      if (res.ok) {
        headerEl.innerHTML = await res.text();
      } else {
        console.error('Failed to load header: ', res.status);
      }
    } catch (e) {
      console.error('Failed to load header', e);
    }
  }

  if (footerEl) {
    try {
      const res = await fetch(basePath + 'footer.html');
      if (res.ok) {
        footerEl.innerHTML = await res.text();
      } else {
        console.error('Failed to load footer: ', res.status);
      }
    } catch (e) {
      console.error('Failed to load footer', e);
    }
  }
});
