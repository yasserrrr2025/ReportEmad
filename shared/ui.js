window.appUI = {
  savePdf: function() {
    const titleEl = document.querySelector('.form-title');
    const title = titleEl ? titleEl.innerText.trim().replace(/\s+/g, '-') : 'document';
    
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
