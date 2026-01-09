(() => {
  class EnhancedCaptcha {
    constructor(form) {
      this.form = form;
      this.startTime = Date.now();
      this.mouseEvents = 0;
      this.keyboardEvents = 0;
      this.mousePath = [];
      this.lastMouseTime = 0;
      this.captchaSolved = false;
      this.uniqueId = this.generateUniqueId();
      
      this.init();
    }

    generateUniqueId() {
      return 'captcha_' + Math.random().toString(36).substr(2, 9);
    }

    init() {
      this.createCaptchaUI();
      this.setupEventListeners();
      this.setupFormValidation();
    }

    createCaptchaUI() {
      const container = document.createElement('div');
      container.className = 'captcha-container';
      container.style.cssText = `
        margin: 20px 0;
        padding: 15px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background: #f9f9f9;
      `;

      // Başlık
      const title = document.createElement('div');
      title.className = 'captcha-title';
      title.textContent = 'Güvenlik Doğrulaması';
      title.style.cssText = `
        font-weight: bold;
        margin-bottom: 10px;
        color: #333;
        font-size: 16px;
      `;

      // Talimatlar
      const instructions = document.createElement('div');
      instructions.className = 'captcha-instructions';
      instructions.textContent = 'Sürgüyü sağa kaydırarak insan olduğunuzu doğrulayın';
      instructions.style.cssText = `
        font-size: 14px;
        color: #666;
        margin-bottom: 15px;
      `;

      // Sürgü container
      const sliderContainer = document.createElement('div');
      sliderContainer.style.cssText = `
        position: relative;
        margin: 20px 0;
      `;

      // Arkaplan çubuğu
      const track = document.createElement('div');
      track.style.cssText = `
        width: 100%;
        height: 40px;
        background: #e0e0e0;
        border-radius: 20px;
        position: relative;
        overflow: hidden;
      `;

      // Doluluk çubuğu
      const fill = document.createElement('div');
      fill.className = 'captcha-fill';
      fill.style.cssText = `
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 0%;
        background: #4CAF50;
        border-radius: 20px;
        transition: width 0.1s;
      `;

      // Sürgü
      this.slider = document.createElement('input');
      this.slider.type = 'range';
      this.slider.min = 0;
      this.slider.max = 100;
      this.slider.value = 0;
      this.slider.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 40px;
        opacity: 0;
        cursor: pointer;
        z-index: 2;
      `;

      // Sürgü butonu (görsel)
      const sliderThumb = document.createElement('div');
      sliderThumb.className = 'slider-thumb';
      sliderThumb.style.cssText = `
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 50px;
        height: 50px;
        background: #2196F3;
        border-radius: 50%;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        transition: left 0.1s;
        user-select: none;
      `;
      sliderThumb.innerHTML = '↔️';

      // İlerleme yüzdesi
      this.progressText = document.createElement('div');
      this.progressText.className = 'progress-text';
      this.progressText.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-weight: bold;
        color: #333;
        z-index: 1;
        font-size: 14px;
      `;

      // Durum mesajı
      this.statusMessage = document.createElement('div');
      this.statusMessage.className = 'captcha-status';
      this.statusMessage.style.cssText = `
        margin-top: 10px;
        font-size: 13px;
        text-align: center;
        min-height: 18px;
      `;

      // Doğrulama token alanı (gizli)
      this.hiddenInput = document.createElement('input');
      this.hiddenInput.type = 'hidden';
      this.hiddenInput.name = 'captcha_token';
      this.hiddenInput.value = '';

      // Bileşenleri birleştir
      track.appendChild(fill);
      track.appendChild(this.progressText);
      sliderContainer.appendChild(track);
      sliderContainer.appendChild(sliderThumb);
      sliderContainer.appendChild(this.slider);

      container.appendChild(title);
      container.appendChild(instructions);
      container.appendChild(sliderContainer);
      container.appendChild(this.statusMessage);
      container.appendChild(this.hiddenInput);

      // Formdan önce ekle
      this.form.insertBefore(container, this.form.firstChild);

      // Referansları sakla
      this.fillElement = fill;
      this.thumbElement = sliderThumb;
    }

    setupEventListeners() {
      // Fare hareketlerini izle
      document.addEventListener('mousemove', (e) => {
        this.mouseEvents++;
        const now = Date.now();
        
        // Fare yolunu kaydet (bot tespiti için)
        this.mousePath.push({
          x: e.clientX,
          y: e.clientY,
          time: now
        });

        // Eski kayıtları temizle (son 5 saniye)
        const fiveSecondsAgo = now - 5000;
        this.mousePath = this.mousePath.filter(point => point.time > fiveSecondsAgo);
        
        this.lastMouseTime = now;
      });

      // Klavye olaylarını izle
      document.addEventListener('keydown', () => {
        this.keyboardEvents++;
      });

      // Sürgü olayları
      this.slider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        this.updateSliderUI(value);
        this.validateCaptcha(value);
      });

      // Sürgüyü bıraktığında
      this.slider.addEventListener('change', (e) => {
        const value = parseInt(e.target.value);
        if (value < 95) {
          this.resetSlider();
          this.showMessage('Lütfen sürgüyü tamamen sağa kaydırın', 'error');
        }
      });
    }

    updateSliderUI(value) {
      const percentage = value + '%';
      
      // Doluluk çubuğunu güncelle
      this.fillElement.style.width = percentage;
      
      // Sürgü butonunu güncelle
      this.thumbElement.style.left = `calc(${percentage} - 25px)`;
      
      // İlerleme yüzdesini güncelle
      this.progressText.textContent = `${value}%`;
      
      // Renk değişimi
      if (value < 30) {
        this.fillElement.style.background = '#ff4444';
      } else if (value < 70) {
        this.fillElement.style.background = '#ffbb33';
      } else {
        this.fillElement.style.background = '#4CAF50';
      }
    }

    resetSlider() {
      this.slider.value = 0;
      this.updateSliderUI(0);
      this.captchaSolved = false;
      this.hiddenInput.value = '';
    }

    validateCaptcha(value) {
      const currentTime = Date.now();
      const elapsedTime = currentTime - this.startTime;
      
      if (value >= 95) {
        // İnsan davranışı analizi
        const isHuman = this.analyzeHumanBehavior(elapsedTime);
        
        if (isHuman) {
          this.captchaSolved = true;
          this.showMessage('✅ Doğrulama başarılı! Formu gönderebilirsiniz.', 'success');
          this.generateToken(elapsedTime);
        } else {
          this.showMessage('⚠️ Şüpheli aktivite tespit edildi. Lütfen tekrar deneyin.', 'warning');
          setTimeout(() => this.resetSlider(), 1000);
        }
      } else if (value > 70) {
        this.showMessage('Neredeyse tamam... Biraz daha kaydırın', 'info');
      }
    }

    analyzeHumanBehavior(elapsedTime) {
      // Minimum süre kontrolü (çok hızlı çözüm bot olabilir)
      if (elapsedTime < 1500) return false;
      
      // Fare hareketi kontrolü
      if (this.mouseEvents < 3) return false;
      
      // Fare yolunun düzensizliğini kontrol et (botlar genellikle düz çizgilerde hareket eder)
      if (this.mousePath.length > 10) {
        const irregularity = this.calculateMouseIrregularity();
        if (irregularity < 1.2) return false; // Çok düzgün bir yol
      }
      
      // Sürgü hareket hızı kontrolü (çok sabit hız bot olabilir)
      const sliderChanges = this.slider._changeCount || 0;
      if (sliderChanges < 5) return false;
      
      return true;
    }

    calculateMouseIrregularity() {
      if (this.mousePath.length < 3) return 0;
      
      let totalAngleChange = 0;
      for (let i = 1; i < this.mousePath.length - 1; i++) {
        const p1 = this.mousePath[i-1];
        const p2 = this.mousePath[i];
        const p3 = this.mousePath[i+1];
        
        const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
        
        const angleDiff = Math.abs(angle1 - angle2);
        totalAngleChange += angleDiff;
      }
      
      return totalAngleChange / (this.mousePath.length - 2);
    }

    generateToken(elapsedTime) {
      // Daha güvenli token oluşturma (gerçek uygulamada sunucudan alınmalı)
      const tokenData = {
        id: this.uniqueId,
        time: elapsedTime,
        mouseEvents: this.mouseEvents,
        keyboardEvents: this.keyboardEvents,
        timestamp: Date.now(),
        solved: true
      };
      
      const token = btoa(JSON.stringify(tokenData));
      this.hiddenInput.value = token;
      
      // Token süresi (5 dakika)
      setTimeout(() => {
        if (!this.formSubmitted) {
          this.captchaSolved = false;
          this.hiddenInput.value = '';
          this.showMessage('⏰ Doğrulama süresi doldu. Lütfen tekrar deneyin.', 'warning');
          this.resetSlider();
        }
      }, 5 * 60 * 1000);
    }

    showMessage(text, type = 'info') {
      this.statusMessage.textContent = text;
      
      // Tipine göre renklendirme
      const colors = {
        error: '#ff4444',
        success: '#4CAF50',
        warning: '#ffbb33',
        info: '#2196F3'
      };
      
      this.statusMessage.style.color = colors[type] || '#333';
    }

    setupFormValidation() {
      // Sürgü değişiklik sayacı
      let changeCount = 0;
      this.slider._changeCount = changeCount;
      
      this.slider.addEventListener('input', () => {
        this.slider._changeCount = ++changeCount;
      });

      this.form.addEventListener('submit', (e) => {
        if (!this.captchaSolved) {
          e.preventDefault();
          this.showMessage('❌ Lütfen önce güvenlik doğrulamasını tamamlayın.', 'error');
          
          // Form alanına odaklan
          this.slider.focus();
          
          // Titreşim efekti (desteklenirse)
          if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
          }
        }
      });
    }
  }

  // Sayfa yüklendiğinde tüm formları bul ve CAPTCHA ekle
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form[data-captcha]').forEach(form => {
      new EnhancedCaptcha(form);
    });
  });

  // Bot koruması: DevTools açıldığında CAPTCHA'yı sıfırla
  window.addEventListener('resize', () => {
    const widthThreshold = 200;
    if (window.outerWidth - window.innerWidth > widthThreshold || 
        window.outerHeight - window.innerHeight > widthThreshold) {
      document.querySelectorAll('.captcha-container').forEach(container => {
        const slider = container.querySelector('input[type="range"]');
        if (slider) {
          slider.value = 0;
          const fill = container.querySelector('.captcha-fill');
          if (fill) fill.style.width = '0%';
        }
      });
    }
  });
})();
