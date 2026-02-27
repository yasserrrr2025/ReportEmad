window.appPdf = {
  exportToPDF: function () {
    var baseName = document.title || 'تقرير';

    var ids = ['reportTitle', 'plcName', 'incStudentName', 'visitingTeacher', 'meetSubject'];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el && el.value && el.value !== 'اسم التقرير') {
        baseName = baseName + ' - ' + el.value.trim();
        break;
      }
    }

    baseName = baseName.replace(/[\/\?<>\\:\*\|":\n\r]/g, '').trim();
    this.makePdf('.sheet', baseName);
  },

  makePdf: async function (sheetSelector, filenameBase) {
    var sheet = document.querySelector(sheetSelector);
    if (!sheet) return;

    var isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent.toLowerCase());

    try { await document.fonts.ready; } catch (e) { }

    // ---- MOBILE: capture the original element directly to avoid off-screen clone issues ----
    if (isMobile) {
      await this._exportMobile(sheet, filenameBase);
      return;
    }

    // ---- DESKTOP: use a hidden clone ----
    await this._exportDesktop(sheet, filenameBase);
  },

  // ---- MOBILE PATH ----
  _exportMobile: async function (sheet, filenameBase) {
    // Hide non-printable elements, capture, restore
    var hidden = [];
    sheet.querySelectorAll('.noprint, .header-actions-bar, [data-nopdf]').forEach(function (el) {
      if (el.style.display !== 'none') {
        hidden.push({ el: el, prev: el.style.display });
        el.style.display = 'none';
      }
    });

    try {
      var canvas = await html2canvas(sheet, {
        scale: 1,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Restore hidden elements
      hidden.forEach(function (item) { item.el.style.display = item.prev; });

      var imgData = canvas.toDataURL('image/jpeg', 0.85);

      var jsPDFCls = window.jspdf && window.jspdf.jsPDF;
      if (!jsPDFCls) { alert('مكتبة PDF غير محملة.'); return; }

      var pdf = new jsPDFCls({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      var pdfW = pdf.internal.pageSize.getWidth();
      var pdfH = pdf.internal.pageSize.getHeight();
      var props = pdf.getImageProperties(imgData);
      var ratio = props.width / props.height;

      var dW = pdfW;
      var dH = dW / ratio;
      if (dH > pdfH) { dH = pdfH; dW = dH * ratio; }

      var x = (pdfW - dW) / 2;
      pdf.addImage(imgData, 'JPEG', x, 0, dW, dH);
      pdf.save(filenameBase + '-' + new Date().toISOString().split('T')[0] + '.pdf');

    } catch (e) {
      hidden.forEach(function (item) { item.el.style.display = item.prev; });
      console.error('Mobile PDF failed:', e);
      alert('حدث خطأ أثناء إنشاء PDF: ' + e.message);
    }
  },

  // ---- DESKTOP PATH ----
  _exportDesktop: async function (sheet, filenameBase) {
    var wrapper;
    try {
      var clone = sheet.cloneNode(true);
      wrapper = document.createElement('div');

      wrapper.style.cssText = 'position:absolute;top:0;left:0;width:210mm;z-index:-9999;background:white;direction:rtl;';
      clone.style.cssText = 'width:210mm;max-width:210mm;height:auto;margin:0;transform:none;';

      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      // Remove non-printable elements from clone
      Array.from(clone.querySelectorAll('.noprint, .header-actions-bar, [data-nopdf], input[type="file"], .flatpickr-calendar')).forEach(function (el) {
        if (el.parentNode) el.parentNode.removeChild(el);
      });

      // Copy values by ID (Flatpickr-safe: uses attribute selector, not index)
      Array.from(sheet.querySelectorAll('input[id], textarea[id], select[id]')).forEach(function (orig) {
        var cloneEl = clone.querySelector('[id="' + orig.id + '"]');
        if (!cloneEl) return;

        if (orig.tagName === 'SELECT') {
          cloneEl.selectedIndex = orig.selectedIndex;
        } else if (orig.tagName === 'TEXTAREA') {
          cloneEl.value = orig.value;
          cloneEl.innerHTML = orig.value;
        } else {
          cloneEl.value = orig.value;
          // Flatpickr altInput: if original is hidden, sync the visible altInput too
          if (orig.style.display === 'none') {
            cloneEl.style.display = 'none';
            var altOrig = orig.nextElementSibling;
            if (altOrig && altOrig.classList && altOrig.classList.contains('flatpickr-input')) {
              var altClone = cloneEl.nextElementSibling;
              if (altClone) { altClone.value = altOrig.value; }
            }
          }
        }
      });

      // Copy radio/checkbox state by ID
      Array.from(sheet.querySelectorAll('input[type="radio"][id], input[type="checkbox"][id]')).forEach(function (orig) {
        var cloneEl = clone.querySelector('[id="' + orig.id + '"]');
        if (cloneEl) cloneEl.checked = orig.checked;
      });

      // Wait for images in clone to load
      await Promise.all(Array.from(clone.querySelectorAll('img')).map(function (img) {
        return img.complete ? Promise.resolve() : new Promise(function (r) { img.onload = r; img.onerror = r; });
      }));

      var canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(wrapper);
      wrapper = null;

      var imgData = canvas.toDataURL('image/jpeg', 0.98);

      var jsPDFCls = window.jspdf && window.jspdf.jsPDF;
      if (!jsPDFCls) { alert('مكتبة PDF غير محملة.'); return; }

      var pdf = new jsPDFCls({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      var pdfW = pdf.internal.pageSize.getWidth();
      var pdfH = pdf.internal.pageSize.getHeight();
      var props = pdf.getImageProperties(imgData);
      var ratio = props.width / props.height;

      var dW = pdfW;
      var dH = dW / ratio;
      if (dH > pdfH) { dH = pdfH; dW = dH * ratio; }

      var x = (pdfW - dW) / 2;
      pdf.addImage(imgData, 'JPEG', x, 0, dW, dH);
      pdf.save(filenameBase + '-' + new Date().toISOString().split('T')[0] + '.pdf');

    } catch (e) {
      if (wrapper && wrapper.parentNode) document.body.removeChild(wrapper);
      console.error('Desktop PDF failed:', e);
      alert('حدث خطأ أثناء إنشاء PDF: ' + e.message);
    }
  }
};
