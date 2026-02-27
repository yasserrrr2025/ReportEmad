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
      baseName = `${baseName} - ${specificName}`;
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

    // Wait for header image to be fully loaded
    const headerImg = document.getElementById('officialHeaderImg');
    if (headerImg && !headerImg.complete) {
      await new Promise((resolve) => {
        headerImg.onload = resolve;
        headerImg.onerror = resolve;
      });
    }

    // Wait for footer image to be fully loaded
    const footerImg = document.getElementById('footerPic');
    if (footerImg && !footerImg.complete) {
      await new Promise((resolve) => {
        footerImg.onload = resolve;
        footerImg.onerror = resolve;
      });
    }

    // Wait for all fonts (like Tajawal) to be fully loaded before capturing
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    try {
      // Create a temporary wrapper to enforce desktop dimensions for the canvas capture
      const originalContainer = sheet.parentElement;
      const clone = sheet.cloneNode(true);
      const wrapper = document.createElement('div');

      // Place wrapper in the DOM but hidden underneath the current view
      // html2canvas often calculates wrong offsets if the element is too far off-screen (-9999px)
      wrapper.style.position = 'absolute';
      wrapper.style.top = '0';
      wrapper.style.left = '0';
      wrapper.style.width = '210mm'; // Exactly A4 width
      wrapper.style.zIndex = '-9999'; // Hide it behind the actual content
      wrapper.style.background = 'white';
      wrapper.style.direction = 'rtl'; // Ensure RTL is preserved in clone

      // Ensure the clone itself has the exact dimensions and no margins
      clone.style.width = '210mm';
      clone.style.maxWidth = '210mm';
      clone.style.height = 'auto';
      clone.style.margin = '0';
      clone.style.transform = 'none';

      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      // Hide elements that shouldn't be printed in the clone
      const noprints = clone.querySelectorAll('.noprint, .header-actions-bar, [data-nopdf], input[type="file"]');
      noprints.forEach(el => el.style.display = 'none');

      // Copy input/textarea values to the clone since cloneNode doesn't copy current values
      // Copy input/textarea/select values to the clone since cloneNode doesn't copy current values
      const originalInputs = sheet.querySelectorAll('input, textarea, select');
      const cloneInputs = clone.querySelectorAll('input, textarea, select');
      for (let i = 0; i < originalInputs.length; i++) {
        cloneInputs[i].value = originalInputs[i].value;
        if (originalInputs[i].tagName === 'TEXTAREA') {
          cloneInputs[i].innerHTML = originalInputs[i].value;
        } else if (originalInputs[i].tagName === 'SELECT') {
          cloneInputs[i].selectedIndex = originalInputs[i].selectedIndex;
        }
      }

      // Very important: Use scale: 1 for mobile to prevent memory crash (canvas gets too large on iOS)
      const scaleCanvas = isMobile ? 1 : 2;
      const imgQuality = isMobile ? 0.8 : 0.98;

      // Use html2canvas directly to get the full image, then fit it on ONE single jsPDF page
      const canvas = await html2canvas(clone, {
        scale: scaleCanvas,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', imgQuality);

      // Access jsPDF from the global window object
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;

      let targetWidth = pdfWidth;
      let targetHeight = targetWidth / ratio;

      let x = 0;
      let y = 0;

      // Smart pagination:
      // If the form is just slightly taller than A4 (up to 12% overflow), shrink it into 1 page to avoid a mostly empty 2nd page.
      // If it's much taller, paginate it properly across multiple A4 pages without microscopic text.
      if (targetHeight <= pdfHeight * 1.12) {
        if (targetHeight > pdfHeight) {
          targetHeight = pdfHeight;
          targetWidth = targetHeight * ratio;
          x = (pdfWidth - targetWidth) / 2;
        }
        pdf.addImage(imgData, 'JPEG', x, y, targetWidth, targetHeight);
      } else {
        // Multi-page logic
        let currentHeight = 0;
        let pageNumber = 1;

        while (currentHeight < targetHeight) {
          if (pageNumber > 1) {
            pdf.addPage();
          }
          // Draw the same image shifted up by the amount of pages we've already rendered
          pdf.addImage(imgData, 'JPEG', 0, -currentHeight, targetWidth, targetHeight);
          currentHeight += pdfHeight;
          pageNumber++;
        }
      }
      pdf.save(`${filenameBase}-${new Date().toISOString().split('T')[0]}.pdf`);

      // Cleanup
      document.body.removeChild(wrapper);

    } catch (e) {
      console.error('PDF generation failed', e);
      alert('حدث خطأ أثناء إنشاء ملف PDF.');
    }
  }
};
