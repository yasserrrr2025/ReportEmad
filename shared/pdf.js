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

    try {
      // Add html2canvas option to capture specifically in a wide width regardless of the device width (solves mobile layout breaking)
      const canvas = await html2canvas(sheet, {
        scale: 2,
        windowWidth: 794,
        useCORS: false,
        allowTaint: false,
        logging: false,
        ignoreElements: (element) => {
          return element.classList.contains('noprint') || element.hasAttribute('data-nopdf') || (element.tagName.toLowerCase() === 'input' && element.type === 'file');
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      // A4 size: 210mm x 297mm
      const pdf = new jspdf.jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = 210; // Exactly 210mm
      const pdfHeight = 297; // Exactly 297mm

      // Draw exactly within A4 dimension constraint
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

      const date = new Date();
      const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      pdf.save(`${filenameBase}-${dateStr}.pdf`);

    } catch (e) {
      console.error('PDF generation failed', e);
      alert('حدث خطأ أثناء إنشاء ملف PDF');
    }
  }
};
