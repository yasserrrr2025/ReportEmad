window.appUI = {
  savePdf: function() {
    const titleEl = document.querySelector('.form-title') || document.querySelector('#reportTitle');
    let title = 'document';
    if (titleEl) {
      title = titleEl.value ? titleEl.value.trim().replace(/\s+/g, '-') : titleEl.innerText.trim().replace(/\s+/g, '-');
    }
    
    // Trigger save first
    if (window.currentPageKey) {
      const extraData = window.getPageExtraData ? window.getPageExtraData() : {};
      window.appStorage.savePage(window.currentPageKey, extraData);
    }

    // Generate PDF
    if (window.appPdf && window.appPdf.makePdf) {
      window.appPdf.makePdf('.sheet', title);
    } else {
      alert('مكتبة PDF غير محملة');
    }
  },
  
  handleImageUpload: function(input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const box = input.parentElement;
        let img = box.querySelector('img');
        if (!img) {
          img = document.createElement('img');
          box.appendChild(img);
        }
        img.src = e.target.result;
        img.style.display = 'block';
        
        const textDiv = box.querySelector('.photo-box-text');
        if(textDiv) textDiv.style.display = 'none';
        
        const span = box.querySelector('span');
        if(span) span.style.display = 'none';
        
        // Trigger save
        if (window.currentPageKey) {
          const extraData = window.getPageExtraData ? window.getPageExtraData() : {};
          window.appStorage.savePage(window.currentPageKey, extraData);
        }
      }
      reader.readAsDataURL(input.files[0]);
    }
  }
};
