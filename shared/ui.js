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

    // Fit text before PDF
    if (window.appUI.fitAllTexts) {
      window.appUI.fitAllTexts();
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
  },

  initTooltips: function() {
    const inputs = document.querySelectorAll('input[type="text"], textarea');
    inputs.forEach(el => {
      el.addEventListener('blur', () => {
        el.title = el.value.trim();
        if (el.classList.contains('fit-text')) {
          window.appUI.fitTextToBox(el);
        }
      });
      // Initial title
      el.title = el.value ? el.value.trim() : '';
    });
  },

  fitTextToBox: function(el, minFont = 9, maxFont = 13) {
    el.style.fontSize = maxFont + 'px';
    let currentFont = maxFont;
    while (el.scrollHeight > el.clientHeight && currentFont > minFont) {
      currentFont -= 0.5;
      el.style.fontSize = currentFont + 'px';
    }
  },

  fitAllTexts: function() {
    document.querySelectorAll('.fit-text').forEach(el => {
      window.appUI.fitTextToBox(el);
    });
  }
};

// Run on load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (window.appUI && window.appUI.initTooltips) {
      window.appUI.initTooltips();
      window.appUI.fitAllTexts();
    }
  }, 500);
});

// Run before print
window.addEventListener('beforeprint', () => {
  if (window.appUI && window.appUI.fitAllTexts) {
    window.appUI.fitAllTexts();
  }
});
