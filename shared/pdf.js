window.appPdf = {
  makePdf: async function(sheetSelector, filenameBase) {
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
      const canvas = await html2canvas(sheet, {
        scale: 2,
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

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      const date = new Date();
      const dateStr = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
      pdf.save(`${filenameBase}-${dateStr}.pdf`);

    } catch (e) {
      console.error('PDF generation failed', e);
      alert('حدث خطأ أثناء إنشاء ملف PDF');
    }
  }
};
