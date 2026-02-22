window.appPdf = {
  makePdf: async function(sheetSelector, filenameBase) {
    const sheet = document.querySelector(sheetSelector);
    if (!sheet) return;

    // Temporarily hide noprint elements
    const noPrintEls = sheet.querySelectorAll('.noprint, [data-nopdf="true"], input[type="file"]');
    const originalDisplays = [];
    noPrintEls.forEach(el => {
      originalDisplays.push(el.style.display);
      el.style.display = 'none';
    });

    // Ensure header image is loaded locally for PDF
    const headerImg = document.getElementById('officialHeaderImg');
    let originalHeaderSrc = '';
    if (headerImg) {
      originalHeaderSrc = headerImg.src;
      headerImg.src = '/assets/header.jpg';
    }

    // Wait a bit for image to apply
    await new Promise(r => setTimeout(r, 500));

    try {
      const canvas = await html2canvas(sheet, {
        scale: 2,
        useCORS: true,
        logging: false
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
    } finally {
      // Restore elements
      noPrintEls.forEach((el, i) => {
        el.style.display = originalDisplays[i];
      });
      if (headerImg) {
        headerImg.src = originalHeaderSrc;
      }
    }
  }
};
