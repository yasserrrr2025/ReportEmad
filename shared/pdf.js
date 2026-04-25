/**
 * pdf.js v7 — School Forms Manager
 * Improved export: uses window.print() for clean output
 * matching the @media print CSS rules, avoiding html2canvas
 * colour/font/layout inconsistencies on local file:// pages.
 */
window.appPdf = {

  /* ─── Public entry point ─────────────────────────────── */
  exportToPDF: function () {
    // Build a meaningful filename from the page title + first filled field
    var baseName = document.title || 'نموذج';
    var candidates = [
      'reportTitle', 'plcName', 'incStudentName', 'visitingTeacher',
      'meetSubject', 'atName', 'lpTeacher', 'cvTeacher', 'rfStudentName',
      'adName', 'letterTitle'
    ];
    for (var i = 0; i < candidates.length; i++) {
      var el = document.getElementById(candidates[i]);
      var val = el ? (el.value || el.textContent || '').trim() : '';
      if (val && val !== baseName) {
        baseName = baseName + ' - ' + val;
        break;
      }
    }
    // Sanitise filename
    baseName = baseName.replace(/[\/\?<>\\:\*\|":\n\r]/g, '').trim();

    var isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent.toLowerCase());
    if (isMobile) {
      this._mobilePrint();
    } else {
      this._desktopPrint(baseName);
    }
  },

  /* ─── Mobile: native share sheet → Save as PDF ──────── */
  _mobilePrint: function () {
    alert(
      'سيتم فتح قائمة الطباعة.\n' +
      'لحفظ PDF:\n' +
      '• iOS: اختر "PDF" أو "حفظ كـ PDF" من أسفل الشاشة\n' +
      '• Android: اختر "حفظ كـ PDF" من قائمة الطابعات'
    );
    window.print();
  },

  /* ─── Desktop: inject a dedicated print stylesheet then print ─ */
  _desktopPrint: function (filenameBase) {
    var self = this;

    // 1. Store values from contenteditable elements
    //    (html2canvas already gone — we rely on @media print CSS)
    self._syncContentEditable();

    // 2. Temporarily set the document <title> so the browser uses
    //    it as the default "save" filename in the print dialog.
    var prevTitle = document.title;
    document.title = filenameBase;

    // 3. Fire the native print dialog.
    //    The @media print rules in styles.css handle layout/footer/header.
    window.print();

    // 4. Restore title after dialog closes (fires synchronously in most browsers)
    document.title = prevTitle;
  },

  /* ─── Sync contenteditable divs into a data-print attribute
         so @media print can show them via content / value ──── */
  _syncContentEditable: function () {
    document.querySelectorAll('[contenteditable]').forEach(function (el) {
      // nothing special needed — print CSS already renders innerHTML
    });
  }
};

/* ─────────────────────────────────────────────────────────────────
   PRINT AUTO-SCALE
   Before the browser renders the print layout, measure the sheet
   height and—if it exceeds one A4 page—apply CSS zoom to body so
   everything (header, content, footer) shrinks proportionally and
   fits on a single page.
───────────────────────────────────────────────────────────────── */
(function () {
  var _scaled = false;

  window.addEventListener('beforeprint', function () {
    var sheet = document.querySelector('.sheet');
    if (!sheet) return;

    // Reset any previous scaling first
    document.body.style.zoom = '';
    _scaled = false;

    // A4 height in CSS pixels: 297mm × (96px / 25.4mm) ≈ 1122 px
    var a4Px = Math.round(297 * 96 / 25.4);
    var sheetH = sheet.scrollHeight;

    if (sheetH > a4Px) {
      // Leave a tiny 2 % breathing room so the last line isn't clipped
      var zoom = (a4Px * 0.98 / sheetH).toFixed(4);
      document.body.style.zoom = zoom;
      _scaled = true;
    }
  });

  window.addEventListener('afterprint', function () {
    if (_scaled) {
      document.body.style.zoom = '';
      _scaled = false;
    }
  });
})();
