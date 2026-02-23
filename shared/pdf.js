window.appPdf = {
  exportToPDF: function () {
    this.makePdf('.sheet', 'تقرير');
  },

  makePdf: async function (sheetSelector, filenameBase) {
    const sheet = document.querySelector(sheetSelector);
    if (!sheet) return;

    // Detect mobile devices
    const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);

    if (isMobile) {
      // === MOBILE: Use window.print() with forced desktop layout ===

      // 1. Hide non-print elements
      const noprints = document.querySelectorAll('.noprint, .header-actions-bar, [data-nopdf], input[type="file"]');
      noprints.forEach(el => el.setAttribute('data-was-visible', el.style.display || ''));
      noprints.forEach(el => el.style.display = 'none');

      // 2. Force desktop-width layout for clean A4 output
      const viewport = document.querySelector('meta[name="viewport"]');
      const originalViewport = viewport ? viewport.getAttribute('content') : '';
      if (viewport) {
        viewport.setAttribute('content', 'width=794');
      }

      // 3. Force sheet to A4 width and calculate scale to fit one page
      const originalStyles = {
        width: sheet.style.width,
        maxWidth: sheet.style.maxWidth,
        margin: sheet.style.margin,
        boxShadow: sheet.style.boxShadow,
        transform: sheet.style.transform,
        transformOrigin: sheet.style.transformOrigin,
      };
      sheet.style.width = '794px';
      sheet.style.maxWidth = '794px';
      sheet.style.margin = '0';
      sheet.style.boxShadow = 'none';

      // 4. Wait for layout reflow
      await new Promise(r => setTimeout(r, 300));

      // 5. Calculate scale to fit content into exactly 1 A4 page (297mm ≈ 1123px at 96dpi)
      const a4HeightPx = 1123;
      const contentHeight = sheet.scrollHeight;
      if (contentHeight > a4HeightPx) {
        const scale = a4HeightPx / contentHeight;
        sheet.style.transformOrigin = 'top center';
        sheet.style.transform = `scale(${scale})`;
      }

      // 6. Wait for scale reflow
      await new Promise(r => setTimeout(r, 200));

      // 7. Print
      window.print();

      // 8. Restore everything after a delay
      setTimeout(() => {
        if (viewport) {
          viewport.setAttribute('content', originalViewport);
        }
        sheet.style.width = originalStyles.width;
        sheet.style.maxWidth = originalStyles.maxWidth;
        sheet.style.margin = originalStyles.margin;
        sheet.style.boxShadow = originalStyles.boxShadow;
        sheet.style.transform = originalStyles.transform;
        sheet.style.transformOrigin = originalStyles.transformOrigin;
        noprints.forEach(el => {
          el.style.display = el.getAttribute('data-was-visible') || '';
          el.removeAttribute('data-was-visible');
        });
      }, 1500);

      return;
    }

    // === DESKTOP: Use html2pdf for direct PDF file download ===

    // Wait for images
    const headerImg = document.getElementById('officialHeaderImg');
    if (headerImg && !headerImg.complete) {
      await new Promise((resolve) => {
        headerImg.onload = resolve;
        headerImg.onerror = resolve;
      });
    }

    const footerImg = document.getElementById('footerPic');
    if (footerImg && !footerImg.complete) {
      await new Promise((resolve) => {
        footerImg.onload = resolve;
        footerImg.onerror = resolve;
      });
    }

    // Wait for fonts
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
