window.appUI = {
    /**
     * Handles image upload from a file input inside a .photo-box.
     * Resizes the image to a max dimension to prevent mobile memory issues during PDF export.
     */
    handleImageUpload: function (input) {
        if (!input.files || !input.files[0]) return;

        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                // Resize to a max dimension to prevent memory issues on mobile
                const MAX_DIM = 1200;
                let width = img.width;
                let height = img.height;

                if (width > MAX_DIM || height > MAX_DIM) {
                    if (width > height) {
                        height = Math.round((height * MAX_DIM) / width);
                        width = MAX_DIM;
                    } else {
                        width = Math.round((width * MAX_DIM) / height);
                        height = MAX_DIM;
                    }
                }

                // Draw on canvas and convert to JPEG for smaller size
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#FFFFFF'; // White background for transparency
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

                // Find the preview <img> inside the same .photo-box
                const box = input.closest('.photo-box');
                if (box) {
                    const preview = box.querySelector('img');
                    if (preview) {
                        preview.src = dataUrl;
                        preview.style.display = 'block';
                    }
                    // Hide the placeholder text
                    const textDiv = box.querySelector('.photo-box-text');
                    if (textDiv) textDiv.style.display = 'none';

                    const span = box.querySelector('span');
                    if (span) span.style.display = 'none';
                }

                // Trigger auto-save if available
                if (window.appStorage && window.currentPageKey) {
                    const extraData = window.getPageExtraData ? window.getPageExtraData() : {};
                    window.appStorage.savePage(window.currentPageKey, extraData);
                }
            };
            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    }
};