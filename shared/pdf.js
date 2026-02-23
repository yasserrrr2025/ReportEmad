window.appPdf = {
  exportToPDF: function () {
    this.makePdf('.sheet', 'تقرير');
  },

  makePdf: async function (sheetSelector, filenameBase) {
    const sheet = document.querySelector(sheetSelector);
    if (!sheet) return;

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
      const opt = {
        margin: 0,
        filename: `${filenameBase}-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 1.5, // 1.5 is a sweet spot for quality vs iOS memory limits
          windowWidth: 794,
          useCORS: true,
          logging: false,
          ignoreElements: (element) => {
            return element.classList.contains('noprint') || element.hasAttribute('data-nopdf') || (element.tagName.toLowerCase() === 'input' && element.type === 'file');
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Add a temporary wrapper to enforce A4 width during capture if it's on a mobile screen
      const originalWidth = sheet.style.width;
      const originalMaxWidth = sheet.style.maxWidth;
      const originalMargin = sheet.style.margin;

      sheet.style.width = '210mm';
      sheet.style.maxWidth = '210mm';
      sheet.style.margin = '0';

      await html2pdf().set(opt).from(sheet).save();

      // Restore styling
      sheet.style.width = originalWidth;
      sheet.style.maxWidth = originalMaxWidth;
      sheet.style.margin = originalMargin;

    } catch (e) {
      console.error('PDF generation failed', e);
      alert('حدث خطأ أثناء إنشاء ملف PDF. يرجى التأكد من مساحة الذاكرة والمحاولة مرة أخرى.');
    }
  }
};
