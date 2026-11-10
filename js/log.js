/* ==========================================================================
   ACADEMIA RITMO - LOGICA TI LOGIN (js/log.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const alertBox = document.getElementById('alertBox');
  const btnRegister = document.getElementById('btnRegister');
  const submitBtn = document.getElementById('submitBtn');

  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  if (btnRegister) {
    btnRegister.addEventListener('click', () => {
      window.location.href = 'register.html';
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = usernameInput ? usernameInput.value.trim() : '';
      const pass = passwordInput ? passwordInput.value.trim() : '';

      if (!user || !pass) {
        if (alertBox) {
          alertBox.textContent = 'Por favor, ingresa tu usuario y contraseña.';
          alertBox.className = 'alert-box error';
          alertBox.style.display = 'block';
        }
        return;
      }

      if (alertBox) {
        alertBox.textContent = 'Iniciando sesión...';
        alertBox.className = 'alert-box success';
        alertBox.style.display = 'block';
      }

      if (submitBtn) submitBtn.disabled = true;

      const formData = new FormData();
      formData.append('correo', user);
      formData.append('password', pass);

      try {
        const response = await fetch('php/login.php', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.status === 'success') {
          if (alertBox) {
            alertBox.textContent = result.message || '¡Inicio de sesión exitoso!';
            alertBox.className = 'alert-box success';
          }

          // RUTEADOR TI PAGINA BASE ITI ROL TI BACKEND
          let paginaDestino = 'index.html'; // Default para RECEPCIONISTA
          const rol = (result.rol || '').toUpperCase();

          if (rol === 'ADMIN') {
            paginaDestino = 'admin.html';
          } else if (rol === 'INSTRUCTOR' || rol === 'DOCENTE') {
            paginaDestino = 'instructor.html';
          } else if (rol === 'RECEPCIONISTA') {
            paginaDestino = 'index.html';
          } else if (result.redirect) {
            paginaDestino = result.redirect;
          }

          setTimeout(() => {
            window.location.href = paginaDestino;
          }, 800);

        } else {
          if (alertBox) {
            alertBox.textContent = result.message || 'Usuario o contraseña incorrectos.';
            alertBox.className = 'alert-box error';
          }
          if (submitBtn) submitBtn.disabled = false;
        }
      } catch (error) {
        console.error('Error ti login:', error);
        if (alertBox) {
          alertBox.textContent = 'Error al conectar con el servidor backend.';
          alertBox.className = 'alert-box error';
        }
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // --- ANIMACIÓN TI BACKGROUND CANVAS ---
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let time = 0;

  const coupleImg = new Image();
  coupleImg.src = 'img/fondo.png'; 

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const particles = Array.from({ length: 45 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 2 + 1,
    speedX: Math.random() * 1.2 - 0.6,
    speedY: Math.random() * 1.2 - 0.6,
    color: Math.random() > 0.5 ? 'rgba(147, 51, 234, ' : 'rgba(236, 72, 153, '
  }));

  const couples = [
    { posX: 0.5,  posY: 0.52, scale: 0.9, speed: 0.030, glow: '#d946ef', shadowBlur: 25 },
    { posX: 0.15, posY: 0.35, scale: 0.6, speed: 0.038, glow: '#6366f1', shadowBlur: 18 },
    { posX: 0.85, posY: 0.35, scale: 0.6, speed: 0.028, glow: '#ec4899', shadowBlur: 18 },
    { posX: 0.10, posY: 0.75, scale: 0.5, speed: 0.042, glow: '#10b981', shadowBlur: 15 },
    { posX: 0.90, posY: 0.75, scale: 0.5, speed: 0.031, glow: '#f59e0b', shadowBlur: 15 }
  ];

  function drawCouple(c, angle) {
    const isMobile = width < 600;
    const finalScale = isMobile ? c.scale * 0.6 : c.scale;
    const centerX = width * c.posX;
    const centerY = height * c.posY;

    const sway = Math.sin(angle) * 7;
    const bounce = Math.cos(angle * 1.2) * 4;

    ctx.save();
    ctx.translate(centerX + sway, centerY + bounce);
    ctx.scale(finalScale, finalScale);

    ctx.strokeStyle = c.glow;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3;
    for (let r = 1; r <= 2; r++) {
      ctx.beginPath();
      ctx.ellipse(0, 160, r * 80 + Math.sin(angle) * 6, r * 15 + Math.cos(angle) * 4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    ctx.shadowBlur = c.shadowBlur;
    ctx.shadowColor = c.glow;

    if (coupleImg.complete && coupleImg.naturalWidth !== 0) {
      ctx.drawImage(coupleImg, -coupleImg.width / 2, -coupleImg.height / 2);
    } else {
      ctx.fillStyle = c.glow;
      ctx.beginPath();
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function animate() {
    ctx.fillStyle = 'rgba(12, 10, 24, 0.32)';
    ctx.fillRect(0, 0, width, height);

    time += 1;

    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + (Math.sin(time * 0.05) * 0.3 + 0.6) + ')';
      ctx.fill();
    });

    couples.forEach(c => {
      const coupleAngle = time * c.speed;
      drawCouple(c, coupleAngle);
    });

    requestAnimationFrame(animate);
  }

  if (coupleImg.complete) {
    animate();
  } else {
    coupleImg.onload = animate;
    coupleImg.onerror = () => { animate(); };
  }
});