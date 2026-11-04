document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const alertBox = document.getElementById('alertBox');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const submitBtn = document.getElementById('submitBtn');
  const spinner = submitBtn ? submitBtn.querySelector('.spinner') : null;

  // Toggle ti password visibility
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      if (confirmPasswordInput) {
        confirmPasswordInput.type = isPassword ? 'text' : 'password';
      }
      togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  function showAlert(message, type = 'error') {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = `alert-box ${type}`;
    alertBox.style.display = 'block';
  }

  function hideAlert() {
    if (alertBox) alertBox.style.display = 'none';
  }

  // Petición ti backend PHP
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const fullname = document.getElementById('fullname').value.trim();
      const username = document.getElementById('username').value.trim();
      const role = document.getElementById('role').value;
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

      if (!fullname || !username || !role || !password || !confirmPassword) {
        showAlert('Por favor, completa todos los campos del formulario.', 'error');
        return;
      }

      if (password.length < 8) {
        showAlert('La contraseña debe tener al menos 8 caracteres.', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showAlert('Las contraseñas no coinciden.', 'error');
        return;
      }

      submitBtn.disabled = true;
      if (spinner) spinner.style.display = 'inline-block';

      const formData = new FormData();
      formData.append('fullname', fullname);
      formData.append('username', username);
      formData.append('role', role);
      formData.append('password', password);

      try {
        const response = await fetch('php/register.php', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.status === 'success') {
          showAlert(result.message, 'success');
          setTimeout(() => {
            window.location.href = 'log.html';
          }, 1500);
        } else {
          showAlert(result.message || 'Error al registrar el usuario.', 'error');
          submitBtn.disabled = false;
          if (spinner) spinner.style.display = 'none';
        }
      } catch (error) {
        showAlert('Error al conectar con el servidor backend.', 'error');
        submitBtn.disabled = false;
        if (spinner) spinner.style.display = 'none';
      }
    });
  }

  // --- ANIMACIÓN TI BACKGROUND CANVAS (FONDO.JPEG) ---
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