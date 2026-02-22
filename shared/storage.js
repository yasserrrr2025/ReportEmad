window.appStorage = {
  savePage: function(key, extraData = {}) {
    const data = { ...extraData };
    const elements = document.querySelectorAll('[data-save="1"]');
    
    elements.forEach(el => {
      if (el.id) {
        if (el.type === 'checkbox' || el.type === 'radio') {
          data[el.id] = el.checked;
        } else {
          data[el.id] = el.value;
        }
      }
    });

    // Save images from photo boxes
    const photoBoxes = document.querySelectorAll('.photo-box img');
    photoBoxes.forEach((img, index) => {
      if (img.src && img.style.display !== 'none') {
        data[`photo_${index}`] = img.src;
      }
    });

    localStorage.setItem(key, JSON.stringify(data));
    
    // Show a brief visual feedback
    const btn = document.querySelector('.dropdown > .btn');
    if(btn) {
      const originalText = btn.innerText;
      btn.innerText = 'تم الحفظ ✓';
      setTimeout(() => btn.innerText = originalText, 2000);
    }
  },

  restorePage: function(key, callback) {
    const saved = localStorage.getItem(key);
    if (!saved) return null;

    try {
      const data = JSON.parse(saved);
      const elements = document.querySelectorAll('[data-save="1"]');
      
      elements.forEach(el => {
        if (el.id && data[el.id] !== undefined) {
          if (el.type === 'checkbox' || el.type === 'radio') {
            el.checked = data[el.id];
          } else {
            el.value = data[el.id];
          }
        }
      });

      // Restore images
      const photoBoxes = document.querySelectorAll('.photo-box img');
      photoBoxes.forEach((img, index) => {
        if (data[`photo_${index}`]) {
          img.src = data[`photo_${index}`];
          img.style.display = 'block';
          const span = img.previousElementSibling;
          if(span && span.tagName === 'SPAN') span.style.display = 'none';
        }
      });

      if (callback) callback(data);
      return data;
    } catch (e) {
      console.error('Error restoring data', e);
      return null;
    }
  },
  
  setupAutoSave: function(key, getExtraData) {
    const inputs = document.querySelectorAll('[data-save="1"]');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        this.savePage(key, getExtraData ? getExtraData() : {});
      });
      input.addEventListener('change', () => {
        this.savePage(key, getExtraData ? getExtraData() : {});
      });
    });
  }
};
