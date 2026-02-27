window.appPdf = {
  exportToPDF: function () {
    var baseName = document.title || 'تقرير';

    var titleInput = document.getElementById('reportTitle');
    var plcName = document.getElementById('plcName');
    var studentName = document.getElementById('incStudentName');
    var visitingTeacher = document.getElementById('visitingTeacher');
    var meetSubject = document.getElementById('meetSubject');

    var specificName = '';

    if (titleInput && titleInput.value && titleInput.value !== 'اسم التقرير') {
      specificName = titleInput.value.trim();
    } else if (plcName && plcName.value) {
      specificName = plcName.value.trim();
    } else if (studentName && studentName.value) {
      specificName = studentName.value.trim();
    } else if (visitingTeacher && visitingTeacher.value) {
      specificName = visitingTeacher.value.trim();
    } else if (meetSubject && meetSubject.value) {
      specificName = meetSubject.value.trim();
    }

    if (specificName) {
      baseName = baseName + ' - ' + specificName;
    }

    baseName = baseName.replace(/[\/\?<>\\:\*\|":\n\r]/g, '').trim();
    this.makePdf('.sheet', baseName);
  },

  makePdf: async function (sheetSelector, filenameBase) {
    var sheet = document.querySelector(sheetSelector);
    if (!sheet) return;

    var isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent.toLowerCase());

    // Wait for fonts
    try { await document.fonts.ready; } catch (e) { }

    try {
      var clone = sheet.cloneNode(true);
      var wrapper = document.createElement('div');

      wrapper.style.cssText = 'position:absolute;top:0;left:0;width:210mm;z-index:-9999;background:white;direction:rtl;';
      clone.style.cssText = 'width:210mm;max-width:210mm;height:auto;margin:0;transform:none;';

      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      // Remove non-printable elements
      Array.from(clone.querySelectorAll('.noprint, .header-actions-bar, [data-nopdf], input[type="file"]')).forEach(function (el) {
        el.parentNode && el.parentNode.removeChild(el);
      });

      // Remove Flatpickr popups if any ended up in the clone
      Array.from(clone.querySelectorAll('.flatpickr-calendar')).forEach(function (el) {
        el.parentNode && el.parentNode.removeChild(el);
      });

      // Copy values: iterate the ORIGINAL sheet to get current values,
      // then find matching element in clone by ID using attribute selector (no CSS.escape needed)
      Array.from(sheet.querySelectorAll('input[id], textarea[id], select[id]')).forEach(function (orig) {
        // Use attribute selector - safe for any ID character
        var cloneEl = clone.querySelector('[id="' + orig.id + '"]');
        if (!cloneEl) return;

        if (orig.tagName === 'SELECT') {
          cloneEl.selectedIndex = orig.selectedIndex;
        } else if (orig.tagName === 'TEXTAREA') {
          cloneEl.value = orig.value;
          cloneEl.innerHTML = orig.value;
        } else {
          cloneEl.value = orig.value;
          // Flatpickr: if original input is hidden by Flatpickr (display:none),
          // make the altInput (next sibling) visible and set its value too
          if (orig.style.display === 'none' || orig.style.visibility === 'hidden') {
            cloneEl.style.display = 'none';
            // Find altInput sibling in original
            var altOrig = orig.nextElementSibling;
            if (altOrig && altOrig.classList.contains('flatpickr-input')) {
              // Find corresponding sibling in clone
              var altClone = cloneEl.nextElementSibling;
              if (altClone) {
                altClone.value = altOrig.value;
                altClone.style.display = '';
              }
            }
          }
        }
      });

      // Copy radio/checkbox checked state
      Array.from(sheet.querySelectorAll('input[type="radio"][id], input[type="checkbox"][id]')).forEach(function (orig) {
        var cloneEl = clone.querySelector('[id="' + orig.id + '"]');
        if (cloneEl) cloneEl.checked = orig.checked;
      });

      var scaleCanvas = isMobile ? 1 : 2;
      var imgQuality = isMobile ? 0.8 : 0.98;

      // Wait for images in the clone before capturing
      var imgs = Array.from(clone.querySelectorAll('img'));
      await Promise.all(imgs.map(function (img) {
        return img.complete ? Promise.resolve() : new Promise(function (r) { img.onload = r; img.onerror = r; });
      }));

      var canvas = await html2canvas(clone, {
        scale: scaleCanvas,
        useCORS: true,
        logging: false
      });

      document.body.removeChild(wrapper);

      var imgData = canvas.toDataURL('image/jpeg', imgQuality);

      var jsPDFCls = window.jspdf && window.jspdf.jsPDF;
      if (!jsPDFCls) { alert('مكتبة PDF غير محملة. يرجى تحديث الصفحة والمحاولة مجدداً.'); return; }

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
      console.error('PDF generation failed:', e);
      if (wrapper && wrapper.parentNode) document.body.removeChild(wrapper);
      alert('حدث خطأ أثناء إنشاء ملف PDF: ' + e.message);
    }
  }
};
