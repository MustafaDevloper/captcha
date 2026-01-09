document.addEventListener("DOMContentLoaded", () => {

  const site = document.getElementById("site-content");
  if (!site) return;

  // HER ZAMAN KİLİTLE
  site.style.display = "none";

  const overlay = document.createElement("div");
  overlay.innerHTML = `
    <div style="
      position:fixed;
      inset:0;
      background:#0f0f0f;
      display:flex;
      align-items:center;
      justify-content:center;
      font-family:Arial;
      color:white;
      z-index:999999;
    ">
      <div style="
        background:#1e1e1e;
        padding:30px;
        border-radius:12px;
        width:320px;
        text-align:center;
      ">
        <h2>Güvenlik Doğrulaması</h2>
        <p>Ben robot değilim</p>

        <input id="captcha-slider" type="range" min="0" max="100" value="0" style="width:100%">
        <div id="captcha-status" style="margin-top:10px;font-size:14px"></div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const slider = overlay.querySelector("#captcha-slider");
  const status = overlay.querySelector("#captcha-status");
  const start = Date.now();

  slider.addEventListener("input", () => {
    if (slider.value >= 95) {

      // BOT ÖNLEMİ: çok hızlıysa reddet
      if (Date.now() - start < 1000) {
        status.textContent = "Çok hızlı, tekrar dene";
        slider.value = 0;
        return;
      }

      status.textContent = "Doğrulandı";

      setTimeout(() => {
        overlay.remove();
        site.style.display = "block";
      }, 300);
    }
  });

});
