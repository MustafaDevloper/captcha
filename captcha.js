// captcha.js
let mousePoints = [];
let isVerified = false;

// 1. Mouse Hareket Takibi (Arka planda sürekli çalışır)
document.addEventListener('mousemove', (e) => {
    if (isVerified) return;
    mousePoints.push({ x: e.clientX, y: e.clientY });
    if (mousePoints.length > 100) mousePoints.shift(); // Son 100 noktayı tut
});

// 2. Proxy/VPN Kontrol Fonksiyonu
async function isUsingProxy() {
    try {
        // Ücretsiz bir IP API'si
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        // Proxy, hosting veya VPN belirtilerini kontrol et
        const blacklisted = ["hosting", "vpn", "proxy", "datacenter"];
        const orgName = (data.org || "").toLowerCase();
        
        return blacklisted.some(word => orgName.includes(word)) || data.proxy === true;
    } catch (e) {
        return false; // API hata verirse geçişe izin ver (opsiyonel)
    }
}

// 3. Mouse Yolu Analizi (Doğallık Kontrolü)
function isBotMovement() {
    if (mousePoints.length < 15) return true; // Yeterli hareket yoksa bottur

    let totalDeviation = 0;
    for (let i = 2; i < mousePoints.length; i++) {
        // Eğim değişimlerini hesapla (Düz çizgide değişim 0'dır)
        const diff = Math.abs(
            (mousePoints[i].y - mousePoints[i-1].y) - 
            (mousePoints[i-1].y - mousePoints[i-2].y)
        );
        totalDeviation += diff;
    }

    console.log("Hareket Sapma Puanı:", totalDeviation);
    // İnsan eli hareket ederken sürekli mikro sapmalar yapar. 
    // 0.5'ten küçük bir sapma mükemmel bir düz çizgidir.
    return totalDeviation < 0.5; 
}

// 4. Ana Fonksiyonu Ezme (Kullanıcının sitesindeki fonksiyonu biz yönetiyoruz)
async function toggleCheckbox() {
    if (isVerified) return;

    const checkbox = document.getElementById('robotCheck');
    const captchaCard = document.getElementById('captchaScreen');
    const welcome = document.getElementById('welcomeScreen');

    // Hemen işaretleme, önce kontrol et
    checkbox.checked = false; 

    // A. Proxy Kontrolü
    const proxyStatus = await isUsingProxy();
    if (proxyStatus) {
        alert("Erişim Reddedildi: Proxy veya VPN kullanılamaz!");
        return;
    }

    // B. Hareket Kontrolü
    if (isBotMovement()) {
        alert("Bot tespiti: Lütfen fareyi daha doğal hareket ettirin!");
        mousePoints = []; // Puanı sıfırla ki tekrar denesin
        return;
    }

    // C. Her şey tamamsa geçişi yap
    isVerified = true;
    checkbox.checked = true;

    setTimeout(() => {
        captchaCard.classList.add('hidden');
        welcome.classList.add('active');
        document.body.style.background = '#2d3436';
    }, 500);
}

// Global scope'a fonksiyonu ata (Kullanıcının sitesinden erişilebilsin diye)
window.toggleCheckbox = toggleCheckbox;