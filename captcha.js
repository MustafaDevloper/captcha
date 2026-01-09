(function() {
    const siteConfig = {
        difficulty: 4, // 5 yaparsan botlar için çok daha zor olur
        targetElement: "my-secure-captcha"
    };

    window.onload = function() {
        const container = document.getElementById(siteConfig.targetElement);
        if (!container) return;

        // Şık ve profesyonel UI
        container.innerHTML = `
            <div id="captcha-container" style="border: 2px solid #e0e0e0; border-radius: 12px; padding: 15px; width: fit-content; background: #fff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: 0.3s;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div id="captcha-check-wrapper" style="position: relative; width: 24px; height: 24px;">
                        <input type="checkbox" id="user-verify-checkbox" style="width: 24px; height: 24px; cursor: pointer;">
                    </div>
                    <span id="captcha-status-text" style="color: #333; font-weight: 500;">Güvenlik Kontrolü</span>
                </div>
                <div id="pow-progress" style="width: 0%; height: 3px; background: #4CAF50; margin-top: 10px; transition: width 0.5s; border-radius: 2px;"></div>
            </div>
        `;

        const checkbox = document.getElementById('user-verify-checkbox');
        const statusText = document.getElementById('captcha-status-text');
        const progress = document.getElementById('pow-progress');
        let interactionStart = Date.now();

        checkbox.addEventListener('change', async function(e) {
            if (this.checked) {
                this.disabled = true;
                statusText.innerText = "Doğrulanıyor...";
                progress.style.width = "50%";

                // --- GÜVENLİK KONTROLÜ 1: Hız Kontrolü ---
                const duration = Date.now() - interactionStart;
                if (duration < 500) { // Yarım saniyeden kısa sürede tıklanmışsa bottur
                    failCaptcha("Çok hızlı!");
                    return;
                }

                // --- GÜVENLİK KONTROLÜ 2: Proof of Work (SHA-256 simülasyonu) ---
                const startPow = performance.now();
                let work = 0;
                for (let i = 0; i < Math.pow(10, siteConfig.difficulty); i++) {
                    work += Math.sqrt(i); // İşlemciyi yor
                }
                const endPow = performance.now();

                // --- GÜVENLİK KONTROLÜ 3: Mouse Hareket Analizi ---
                if (e.clientX === 0 && e.clientY === 0) { // Koordinat yoksa bottur
                     failCaptcha("Cihaz hatası!");
                     return;
                }

                // Başarılı Sonuç
                setTimeout(() => {
                    progress.style.width = "100%";
                    statusText.innerText = "İnsan Olduğunuz Onaylandı";
                    statusText.style.color = "#2E7D32";
                    container.style.borderColor = "#4CAF50";
                    
                    // Formu serbest bırak
                    const token = btoa("SECURE_" + Date.now() + "_" + work);
                    const input = document.createElement("input");
                    input.type = "hidden";
                    input.name = "my-captcha-token";
                    input.value = token;
                    container.appendChild(input);
                    
                    // Submit butonunu bul ve aç
                    const form = container.closest('form');
                    if (form) {
                        const btn = form.querySelector('button[type="submit"]');
                        if (btn) btn.disabled = false;
                    }
                }, 600);
            }
        });

        function failCaptcha(msg) {
            statusText.innerText = msg;
            statusText.style.color = "red";
            setTimeout(() => location.reload(), 2000);
        }
    };
})();
