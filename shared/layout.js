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

  // ── Pin footer to A4 bottom ──────────────────────────────────
  // Sets .sheet-content min-height = 297mm - headerHeight - footerHeight
  // so the footer is always pushed to the very bottom of the A4 sheet.
  function pinFooter() {
    var header  = document.getElementById('appHeader');
    var footer  = document.getElementById('appFooter');
    var content = document.querySelector('.sheet-content');
    if (!content || !footer) return;

    // Reset first so measurements are natural
    content.style.minHeight = '';

    // 297mm converted to CSS pixels at 96 dpi
    var A4px   = Math.round(297 * 96 / 25.4); // ≈ 1122 px
    var headerH = header ? header.offsetHeight : 0;
    var footerH = footer.offsetHeight;
    var minH    = A4px - headerH - footerH;

    if (minH > 0) {
      content.style.minHeight = minH + 'px';
    }
  }

  // Run after header/footer images finish loading
  var imgs = document.querySelectorAll('#appHeader img, #appFooter img');
  var loaded = 0;
  if (imgs.length === 0) {
    pinFooter();
  } else {
    imgs.forEach(function (img) {
      if (img.complete) {
        loaded++;
        if (loaded === imgs.length) pinFooter();
      } else {
        img.addEventListener('load',  function () { loaded++; if (loaded === imgs.length) pinFooter(); });
        img.addEventListener('error', function () { loaded++; if (loaded === imgs.length) pinFooter(); });
      }
    });
  }

  // Re-pin on window resize
  window.addEventListener('resize', pinFooter);

  // Re-pin whenever rows/content are added dynamically
  var pinObserver = new MutationObserver(function () { pinFooter(); });
  pinObserver.observe(document.body, { childList: true, subtree: true, characterData: true });

  // ── Auto-grow all textareas ──────────────────────────────────
  function autoGrow(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
    el.style.overflowY = 'hidden';
  }

  function initAutoGrow() {
    document.querySelectorAll('textarea').forEach(function (ta) {
      autoGrow(ta);
      if (!ta._agBound) {
        ta.addEventListener('input', function () { autoGrow(ta); pinFooter(); });
        ta._agBound = true;
      }
    });
  }

  initAutoGrow();
  setTimeout(function () { initAutoGrow(); pinFooter(); }, 500);

  var growObserver = new MutationObserver(function () { initAutoGrow(); });
  growObserver.observe(document.body, { childList: true, subtree: true });
});
