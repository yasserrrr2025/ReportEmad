document.addEventListener('DOMContentLoaded', async () => {
  const headerEl = document.getElementById('appHeader');
  const footerEl = document.getElementById('appFooter');

  // Use absolute path from root
  const basePath = '/shared/';

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
