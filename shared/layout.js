document.addEventListener('DOMContentLoaded', async () => {
  const headerEl = document.getElementById('appHeader');
  const footerEl = document.getElementById('appFooter');

  // Determine base path based on current URL
  const path = window.location.pathname;
  const isPagesDir = path.includes('/pages/');
  const basePath = isPagesDir ? '../shared/' : './shared/';

  const fallbackHeader = `
    <div class="official-header">
      <div class="header-bg">
        <img src="../assets/header.jpg" alt="Header Background" onerror="this.src='./assets/header.jpg'">
      </div>
      <div class="header-actions noprint">
        <div class="dropdown">
          <button class="btn-dark" onclick="window.appPdf.exportToPDF()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            تصدير PDF
          </button>
        </div>
      </div>
    </div>`;

  const fallbackFooter = `
    <div class="official-footer">
      <img src="../assets/footer.jpg" alt="Footer Background" onerror="this.src='./assets/footer.jpg'">
    </div>`;

  if (headerEl) {
    try {
      const res = await fetch(basePath + 'header.html');
      if (res.ok) {
        headerEl.innerHTML = await res.text();
      } else {
        console.error('Failed to load header: ', res.status);
        headerEl.innerHTML = fallbackHeader;
      }
    } catch (e) {
      console.error('Failed to load header', e);
      headerEl.innerHTML = fallbackHeader;
    }
  }

  if (footerEl) {
    try {
      const res = await fetch(basePath + 'footer.html');
      if (res.ok) {
        footerEl.innerHTML = await res.text();
      } else {
        console.error('Failed to load footer: ', res.status);
        footerEl.innerHTML = fallbackFooter;
      }
    } catch (e) {
      console.error('Failed to load footer', e);
      footerEl.innerHTML = fallbackFooter;
    }
  }
});
