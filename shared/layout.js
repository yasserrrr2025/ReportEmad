document.addEventListener('DOMContentLoaded', async () => {
  const headerEl = document.getElementById('appHeader');
  const footerEl = document.getElementById('appFooter');

  // Determine depth of current path to correctly load shared assets
  const pathParts = window.location.pathname.split('/').filter(p => p.length > 0);
  // Find where we are relative to the project structure
  // 'pages' or 'shared' generally indicates we are inside a subfolder
  const inPagesFolder = pathParts.includes('pages');
  const basePath = inPagesFolder ? '../shared/' : './shared/';

  const assetsPath = inPagesFolder ? '../assets/' : './assets/';

  const fallbackHeader = `
    <div class="official-header">
      <div class="header-bg">
        <img src="${assetsPath}header.jpg" alt="Header Background">
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
      <img src="${assetsPath}footer.jpg" alt="Footer Background">
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
