window.appPdf = {
  exportToPDF: function () {
    let baseName = document.title || 'تقرير';

    const titleInput = document.getElementById('reportTitle');
    const plcName = document.getElementById('plcName');
    const studentName = document.getElementById('incStudentName');
    const visitingTeacher = document.getElementById('visitingTeacher');
    const meetSubject = document.getElementById('meetSubject');

    let specificName = '';

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

    // Clean invalid filename characters
    baseName = baseName.replace(/[\/\?<>\\:\*\|":\n\r]/g, '').trim();

    this.makePdf('.sheet', baseName);
  },

  makePdf: async function (sheetSelector, filenameBase) {
    const sheet = document.querySelector(sheetSelector);
    if (!sheet) return;

    // Detect mobile devices
    const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent.toLowerCase());

    // Wait for all images inside the sheet to load
    const allImgs = sheet.querySelectorAll('img');
    await Promise.all(Array.from(allImgs).map(function (img) {
      return img.complete ? Promise.resolve() : new Promise(function (r) { img.onload = r; img.onerror = r; });
    }));

    // Wait for all fonts to be ready
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    try {
      // Clone the sheet for off-screen rendering
      const clone = sheet.cloneNode(true);
      const wrapper = document.createElement('div');

      wrapper.style.position = 'absolute';
      wrapper.style.top = '0';
      wrapper.style.left = '0';
      wrapper.style.width = '210mm';
      wrapper.style.zIndex = '-9999';
      wrapper.style.background = 'white';
      wrapper.style.direction = 'rtl';

      clone.style.width = '210mm';
      clone.style.maxWidth = '210mm';
      clone.style.height = 'auto';
      clone.style.margin = '0';
      clone.style.transform = 'none';

      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      // Hide non-printable elements in the clone
      clone.querySelectorAll('.noprint, .header-actions-bar, [data-nopdf], input[type="file"], .flatpickr-calendar').forEach(function (el) {
        el.style.display = 'none';
      });

      // SAFE value copy: match by ID to avoid Flatpickr altInput index mismatch.
      // Flatpickr's altInput:true creates an extra hidden input element which shifts
      // the old index-based loop — this approach is immune to that.
      sheet.querySelectorAll('input[id], textarea[id], select[id]').forEach(function (orig) {
        var cloneEl = clone.querySelector('#' + CSS.escape(orig.id));
        if (!cloneEl) return;
        if (orig.tagName === 'SELECT') {
          cloneEl.selectedIndex = orig.selectedIndex;
        } else if (orig.tagName === 'TEXTAREA') {
          cloneEl.value = orig.value;
          cloneEl.innerHTML = orig.value;
        } else {
          cloneEl.value = orig.value;
        }
      });

      // Also copy radio/checkbox checked state by ID
      sheet.querySelectorAll('input[type="radio"][id], input[type="checkbox"][id]').forEach(function (orig) {
        var cloneEl = clone.querySelector('#' + CSS.escape(orig.id));
        if (cloneEl) cloneEl.checked = orig.checked;
      });

      // Use scale: 1 on mobile to avoid memory crash on iOS
      var scaleCanvas = isMobile ? 1 : 2;
      var imgQuality = isMobile ? 0.8 : 0.98;

      var canvas = await html2canvas(clone, {
        scale: scaleCanvas,
        useCORS: true,
        logging: false,
        allowTaint: true
      });

      var imgData = canvas.toDataURL('image/jpeg', imgQuality);

      var jsPDFLib = window.jspdf.jsPDF;
      var pdf = new jsPDFLib({ unit: 'mm', format: 'a4', orientation: 'portrait' });

      var pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
      var pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      var imgProps = pdf.getImageProperties(imgData);
      var imgRatio = imgProps.width / imgProps.height;

      // Always shrink-to-fit on exactly ONE A4 page
      var drawWidth = pdfWidth;
      var drawHeight = drawWidth / imgRatio;

      if (drawHeight > pdfHeight) {
        drawHeight = pdfHeight;
        drawWidth = drawHeight * imgRatio;
      }

      var x = (pdfWidth - drawWidth) / 2;
      pdf.addImage(imgData, 'JPEG', x, 0, drawWidth, drawHeight);
      pdf.save(filenameBase + '-' + new Date().toISOString().split('T')[0] + '.pdf');

      document.body.removeChild(wrapper);

    } catch (e) {
      console.error('PDF generation failed', e);
      alert('حدث خطأ أثناء إنشاء ملف PDF.');
    }
  }
};
