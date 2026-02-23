window.appPdf = {
  exportToPDF: function () {
    this.makePdf('.sheet', 'تقرير');
  },

  makePdf: async function (sheetSelector, filenameBase) {
    const sheet = document.querySelector(sheetSelector);
    if (!sheet) return;

    // Detect mobile devices
    const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);

    // On mobile: use native browser print (100% reliable, no memory issues)
    if (isMobile) {
      // Hide action bar and non-print elements before printing
      const noprints = document.querySelectorAll('.noprint, .header-actions-bar, [data-nopdf]');
      noprints.forEach(el => el.style.display = 'none');

      window.print();

      // Restore elements after print dialog closes
      setTimeout(() => {
        noprints.forEach(el => el.style.display = '');
      }, 1000);
      return;
    }

    // Desktop: use html2pdf for direct PDF download
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
          scale: 2,
          windowWidth: 794,
          useCORS: true,
          logging: false,
          ignoreElements: (element) => {
            return element.classList.contains('noprint') || element.hasAttribute('data-nopdf') || (element.tagName.toLowerCase() === 'input' && element.type === 'file');
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(sheet).save();

    } catch (e) {
      console.error('PDF generation failed', e);
      alert('حدث خطأ أثناء إنشاء ملف PDF.');
    }
  }
};
