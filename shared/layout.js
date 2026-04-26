document.addEventListener('DOMContentLoaded', async () => {
  const headerEl = document.getElementById('appHeader');
  const footerEl = document.getElementById('appFooter');

  const pathParts = window.location.pathname.split('/').filter(p => p.length > 0);
  const inPagesFolder = pathParts.includes('pages');
  const assetsPath = inPagesFolder ? '../assets/' : './assets/';

  const headerContent = `
    <div class="header-actions-bar noprint">
      <div class="actions-group">
        <button class="btn-action btn-home" onclick="window.location.href='../index.html'">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span class="btn-text">الرئيسية</span>
        </button>
        <button class="btn-action btn-pdf" onclick="window.appPdf.exportToPDF()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span class="btn-text">تصدير PDF</span>
        </button>
        <button class="btn-action btn-print" onclick="window.print()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          <span class="btn-text">طباعة</span>
        </button>
      </div>
      <div class="actions-group">
        <button class="btn-action btn-clear" onclick="if(window.appStorage && window.appStorage.clearPage) window.appStorage.clearPage(window.currentPageKey)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          <span class="btn-text">تفريغ الاستمارة</span>
        </button>
      </div>
    </div>
    <div class="official-header">
      <div class="header-bg">
        <img src="${assetsPath}header.jpg" alt="Header Background" onerror="this.onerror=null; this.src='../assets/header.jpg';">
      </div>
    </div>`;

  const footerContent = `
    <div class="official-footer">
      <img src="${assetsPath}footer.jpg" alt="Footer Background" onerror="this.onerror=null; this.src='../assets/footer.jpg';">
    </div>`;

  if (headerEl) headerEl.innerHTML = headerContent;
  if (footerEl)  footerEl.innerHTML = footerContent;

  // ── Reserve space for fixed header & footer in print ────────────
  // Measures actual header/footer heights and stores them as CSS
  // custom properties so @media print padding is always accurate.
  function reserveSpace() {
    var header  = document.getElementById('appHeader');
    var footer  = document.getElementById('appFooter');
    var content = document.querySelector('.sheet-content');
    if (!content) return;

    // Header: measure only the official-header img part (action bar hidden in print)
    var officialHeader = header ? header.querySelector('.official-header') : null;
    var hh = officialHeader ? officialHeader.offsetHeight : (header ? header.offsetHeight : 0);

    // Footer height
    var fh = footer ? footer.offsetHeight : 0;

    // Set CSS custom properties on :root so @media print can use them
    document.documentElement.style.setProperty('--print-header-h', (hh + 25) + 'px');
    document.documentElement.style.setProperty('--print-footer-h', (fh + 4) + 'px');

    // Also set screen padding-bottom to reserve footer space
    if (fh > 0) content.style.paddingBottom = (fh + 4) + 'px';
  }

  // Run after both header & footer images load
  var allImgs = document.querySelectorAll('#appHeader img, #appFooter img');
  var loadedCount = 0;
  function onImgDone() { loadedCount++; if (loadedCount >= allImgs.length) reserveSpace(); }
  if (allImgs.length === 0) {
    reserveSpace();
  } else {
    allImgs.forEach(function(img) {
      if (img.complete) { onImgDone(); }
      else { img.addEventListener('load', onImgDone);  window.addEventListener('resize', reserveSpace); }
    });
  }
  // Fallback
  setTimeout(reserveSpace, 700);

  // ── Auto-grow textareas ──────────────────────────────────────
  function autoGrow(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
    el.style.overflowY = 'hidden';
  }

  function initAutoGrow() {
    document.querySelectorAll('textarea').forEach(function (ta) {
      autoGrow(ta);
      if (!ta._agBound) {
        ta.addEventListener('input', function () { autoGrow(ta); });
        ta._agBound = true;
      }
    });
  }

  initAutoGrow();
  setTimeout(initAutoGrow, 500);

  var observer = new MutationObserver(function () { initAutoGrow(); });
  observer.observe(document.body, { childList: true, subtree: true });
});

