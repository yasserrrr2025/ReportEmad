window.appPdf = {
  exportToPDF: function () {
    this.makePdf('.sheet', 'تقرير');
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
      clone.style.margin = '0';
      clone.style.transform = 'none';

      // Ensure the clone itself has the exact dimensions and no margins
      clone.style.width = '210mm';
      clone.style.maxWidth = '210mm';
      clone.style.margin = '0';
      clone.style.transform = 'none';

      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      // Hide elements that shouldn't be printed in the clone
      const noprints = clone.querySelectorAll('.noprint, .header-actions-bar, [data-nopdf], input[type="file"]');
      noprints.forEach(el => el.style.display = 'none');

      // Copy input/textarea values to the clone since cloneNode doesn't copy current values
      const originalInputs = sheet.querySelectorAll('input, textarea');
      const cloneInputs = clone.querySelectorAll('input, textarea');
      for (let i = 0; i < originalInputs.length; i++) {
        cloneInputs[i].value = originalInputs[i].value;
        if (originalInputs[i].tagName === 'TEXTAREA') {
          cloneInputs[i].innerHTML = originalInputs[i].value;
        }
      }

      // Very important: Use scale: 1 for mobile to prevent memory crash (canvas gets too large on iOS)
      const scaleCanvas = isMobile ? 1 : 2;
      const imgQuality = isMobile ? 0.8 : 0.98;

      const opt = {
        margin: 0,
        filename: `${filenameBase}-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: imgQuality },
        html2canvas: {
          scale: scaleCanvas,
          windowWidth: 794,
          useCORS: true,
          logging: false
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(clone).save();

      // Cleanup
      document.body.removeChild(wrapper);

    } catch (e) {
      console.error('PDF generation failed', e);
      alert('حدث خطأ أثناء إنشاء ملف PDF.');
    }
  }
};
