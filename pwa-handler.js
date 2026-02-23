document.addEventListener('DOMContentLoaded', () => {
    // 1. Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').then((registration) => {
                console.log('ServiceWorker registration successful');
            }).catch((error) => {
                console.log('ServiceWorker registration failed: ', error);
            });
        });
    }

    // CSS for the banner
    const pwaStyles = document.createElement('style');
    pwaStyles.innerHTML = `
        .pwa-banner {
            position: fixed;
            bottom: -150px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 400px;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 15px 20px;
            z-index: 99999;
            transition: bottom 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: 1px solid #e1e8ed;
            direction: rtl;
        }
        .pwa-banner.visible {
            bottom: 30px;
        }
        .pwa-banner-content {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .pwa-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #0d9488, #0f766e);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 4px 10px rgba(13, 148, 136, 0.3);
        }
        .pwa-text {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .pwa-text h4 {
            margin: 0;
            font-size: 15px;
            color: #1e293b;
            font-weight: 800;
            font-family: 'Tajawal', sans-serif;
        }
        .pwa-text p {
            margin: 0;
            font-size: 12px;
            color: #64748b;
            font-family: 'Tajawal', sans-serif;
        }
        .pwa-actions {
            display: flex;
            gap: 10px;
        }
        .pwa-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-family: 'Tajawal', sans-serif;
            font-weight: 800;
            transition: all 0.2s;
        }
        .pwa-btn:active {
            transform: scale(0.95);
        }
        .pwa-btn-install {
            background: #0d9488;
            color: white;
            box-shadow: 0 2px 6px rgba(13, 148, 136, 0.2);
        }
        .pwa-btn-install:hover {
            background: #0f766e;
        }
        .pwa-btn-dismiss {
            color: #64748b;
            background: #f1f5f9;
        }
        .pwa-btn-dismiss:hover {
            background: #e2e8f0;
            color: #334155;
        }
        @media (max-width: 480px) {
            .pwa-banner {
                flex-direction: column;
                gap: 15px;
                text-align: center;
                padding: 20px;
                width: 85%;
            }
            .pwa-banner-content {
                flex-direction: column;
            }
            .pwa-actions {
                width: 100%;
                justify-content: center;
            }
            .pwa-btn {
                flex: 1;
            }
        }
    `;
    document.head.appendChild(pwaStyles);

    // Create Banner HTML
    const banner = document.createElement('div');
    banner.className = 'pwa-banner';
    banner.innerHTML = `
        <div class="pwa-banner-content">
            <div class="pwa-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div class="pwa-text">
                <h4 id="pwa-title">تثبيت التطبيق</h4>
                <p id="pwa-desc">أضف النظام للشاشة الرئيسية لسهولة الوصول</p>
            </div>
        </div>
        <div class="pwa-actions">
            <button class="pwa-btn pwa-btn-dismiss" id="pwa-btn-dismiss">لاحقاً</button>
            <button class="pwa-btn pwa-btn-install" id="pwa-btn-install">تثبيت</button>
        </div>
    `;
    document.body.appendChild(banner);

    const installBtn = document.getElementById('pwa-btn-install');
    const dismissBtn = document.getElementById('pwa-btn-dismiss');
    const titleEl = document.getElementById('pwa-title');
    const descEl = document.getElementById('pwa-desc');

    // 2. Handle Android/Desktop Install Prompt
    let deferredPrompt;
    const isPwaDismissed = localStorage.getItem('pwaDismissed') === 'true';

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;

        // Show the custom install banner if not dismissed
        if (!isPwaDismissed) {
            setTimeout(() => banner.classList.add('visible'), 1500);
        }
    });

    installBtn.addEventListener('click', async () => {
        // If it's iOS and we override the button logic
        if (isIos() && !isInStandaloneMode()) {
            alert('يرجى الضغط على زر المشاركة أرسل [Share] أسفل الشاشة ثم اختيار "الإضافة للشاشة الرئيسية" (Add to Home Screen)');
            banner.classList.remove('visible');
            return;
        }

        if (deferredPrompt) {
            banner.classList.remove('visible');
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            deferredPrompt = null;
        } else {
            // Fallback
            alert('يرجى استخدام خيارات المتصفح للإضافة إلى الشاشة الرئيسية.');
            banner.classList.remove('visible');
        }
    });

    dismissBtn.addEventListener('click', () => {
        banner.classList.remove('visible');
        localStorage.setItem('pwaDismissed', 'true');
    });

    window.addEventListener('appinstalled', (evt) => {
        console.log('App was installed.');
        banner.classList.remove('visible');
    });

    // 3. Handle iOS Safari Instructions
    const isIos = () => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        return /iphone|ipad|ipod/.test(userAgent);
    };
    const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

    if (isIos() && !isInStandaloneMode() && !isPwaDismissed) {
        // Change text for iOS
        titleEl.innerText = 'تثبيت على الآيفون';
        descEl.innerText = 'اضغط على زر المشاركة ثم "الإضافة للشاشة الرئيسية"';
        installBtn.innerText = 'طريقة التثبيت';

        setTimeout(() => banner.classList.add('visible'), 2000);
    }
});
