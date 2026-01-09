(function() {
    // --- AYARLAR ---
    const config = {
        title: "Güvenlik Kontrolü",
        subtitle: "Site içeriğine erişmek için doğrulama gerekiyor.",
        difficulty: 700000, // Botları yoracak işlem sayısı
        minTime: 500 // İnsani refleks süresi (ms)
    };

    // --- STİL ENJEKSİYONU (CSS) ---
    const style = document.createElement('style');
    style.innerHTML = `
        body.captcha-locked { overflow: hidden !important; height: 100vh !important; }
        #md-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(8px);
            z-index: 2147483647; /* En üst katman */
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        #md-box {
            background: white; padding: 30px; border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15); border: 1px solid #e0e0e0;
            text-align: center; width: 320px;
        }
        .md-checkbox-wrapper {
            display: flex; align-items: center; justify-content: center;
            gap: 15px; margin-top: 20px; padding: 15px;
            background: #f9f9f9; border: 2px solid #ddd; border-radius: 8px;
            cursor: pointer; transition: 0.2s;
        }
        .md-checkbox-wrapper:hover { border-color: #bbb; }
        #md-checkbox { width: 22px; height: 22px; cursor: pointer; accent-color: #2196F3; }
        #md-status { font-weight: 500; color: #555; font-size: 14px; }
        .md-spinner {
            border: 3px solid #f3f3f3; border-top: 3px solid #3498db;
            border-radius: 50%; width: 18px; height: 18px;
            animation: spin 1s linear infinite; display: none;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);

    // --- HTML OLUŞTURMA ---
    function init() {
        // Body'i kilitle
        document.body.classList.add('captcha-locked');

        const overlay = document.createElement('div');
        overlay.id = 'md-overlay';
        overlay.innerHTML = `
            <div id="md-box">
                <h2 style="margin:0; font-size:22px; color:#333;">${config.title}</h2>
                <p style="margin:10px 0 0; font-size:14px; color:#666;">${config.subtitle}</p>
                
                <div class="md-checkbox-wrapper" id="md-trigger">
                    <input type="checkbox" id="md-checkbox">
                    <span id="md-status">Ben robot değilim</span>
                    <div class="md-spinner" id="md-loader"></div>
                </div>
                
                <div style="margin-top:20px; font-size:11px; color:#999;">
                    Protected by MustafaDevloper System
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        setupLogic();
    }

    // --- MANTIK VE GÜVENLİK ---
    function setupLogic() {
        const checkbox = document.getElementById('md-checkbox');
        const trigger = document.getElementById('md-trigger');
        const status = document.getElementById('md-status');
        const loader = document.getElementById('md-loader');
        const overlay = document.getElementById('md-overlay');

        let startHover = 0;

        // Mouse takibi (Botlar genelde doğrudan tıklar, hover yapmaz)
        trigger.addEventListener('mouseenter', () => { startHover = Date.now(); });

        checkbox.addEventListener('change', async function(e) {
            if (this.checked) {
                this.style.display = 'none';
                loader.style.display = 'block';
                status.innerText = "Güvenlik kontrolü...";
                
                // 1. ZAMAN ANALİZİ
                const hoverTime = Date.now() - startHover;
                if (hoverTime < 50 && startHover !== 0) { 
                    // Çok hızlı tıklandıysa şüpheli
                    await delay(1000); 
                }

                // 2. PROOF OF WORK (İŞLEMCİ YORMA)
                await new Promise(resolve => setTimeout(resolve, 100)); // UI update için bekle
                const startPoW = performance.now();
                let hash = 0;
                for(let i=0; i < config.difficulty; i++) {
                    hash += Math.sqrt(Math.abs(Math.sin(i) * Math.cos(i)));
                }
                const endPoW = performance.now();

                // 3. DOĞRULAMA VE AÇILIŞ
                if ((endPoW - startPoW) < 5) {
                     // İşlemci hiç yorulmadıysa (Emülatör şüphesi)
                     status.innerText = "Tekrar deneyin.";
                     status.style.color = "red";
                     this.checked = false;
                     return;
                }

                // BAŞARILI
                loader.style.display = 'none';
                status.innerText = "Doğrulandı ✓";
                status.style.color = "#2e7d32";
                trigger.style.borderColor = "#2e7d32";
                trigger.style.background = "#e8f5e9";

                setTimeout(() => {
                    overlay.style.transition = "opacity 0.5s";
                    overlay.style.opacity = "0";
                    document.body.classList.remove('captcha-locked');
                    setTimeout(() => overlay.remove(), 500);
                }, 800);
            }
        });
    }

    function delay(ms) { return new Promise(res => setTimeout(res, ms)); }

    // Sayfa yüklendiğinde çalıştır
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
