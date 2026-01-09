(() => {
  let start = Date.now();
  let moved = false;

  document.addEventListener("mousemove", () => moved = true);

  window.addEventListener("load", () => {
    document.querySelectorAll("form[data-captcha]").forEach(form => {

      // CAPTCHA UI
      const box = document.createElement("div");
      box.style.margin = "10px 0";

      const label = document.createElement("div");
      label.innerText = "Kaydır ve doğrula";
      label.style.fontSize = "14px";

      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = 0;
      slider.max = 100;
      slider.value = 0;
      slider.style.width = "100%";

      box.appendChild(label);
      box.appendChild(slider);
      form.appendChild(box);

      form.addEventListener("submit", e => {
        const time = Date.now() - start;

        if (time < 1500 || !moved || slider.value < 95) {
          e.preventDefault();
          alert("Doğrulama başarısız");
        }
      });
    });
  });
})();
