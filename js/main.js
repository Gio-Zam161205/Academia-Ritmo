/* ==========================================================================
   ACADEMIA RITMO - LÓGICA DE INTERFAZ E ILUMINACIÓN LIGERA DE FONDO (CU-01)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCU01();
  initBgCanvas();
});

/* --- LÓGICA DE ASISTENCIA Y CONTADORES --- */
function initCU01() {
  const switchBtns = document.querySelectorAll('.cu01-switch');
  const syncBtn = document.getElementById('cu01-sync-btn');
  const modal = document.getElementById('cu01-modal');
  const modalClose = document.getElementById('cu01-modal-close');
  const counterTag = document.getElementById('cu01-counter');
  const metaTitleTag = document.getElementById('meta-title');
  const studentList = document.getElementById('student-list');
  const groupSelect = document.getElementById('cu01-group-select');

  if (!studentList) return;

  function updateCounter() {
    const totalAlumnos = studentList.querySelectorAll('.student-card').length;
    const presentes = studentList.querySelectorAll('.cu01-switch.active').length;

    if (counterTag) {
      counterTag.textContent = `${presentes} / ${totalAlumnos} Presentes`;
    }

    if (metaTitleTag) {
      metaTitleTag.textContent = `Nómina del Grupo (${totalAlumnos} Alumnos)`;
    }
  }

  switchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.student-card');
      const isPresent = btn.classList.toggle('active');

      if (isPresent) {
        btn.innerHTML = `<span>✓</span> Presente`;
        card.classList.add('marked');
      } else {
        btn.innerHTML = `<span>✕</span> Falta`;
        card.classList.remove('marked');
      }
      updateCounter();
    });
  });

  if (syncBtn && modal) {
    syncBtn.addEventListener('click', () => {
      modal.classList.add('active');
    });
  }

  if (modalClose && modal) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }

  if (groupSelect) {
    groupSelect.addEventListener('change', () => {
      console.log(`Cargando grupo: ${groupSelect.options[groupSelect.selectedIndex].text}`);
    });
  }

  updateCounter();
}

/* --- CANVAS DE PARTÍCULAS LIGERAS NEÓN --- */
function initBgCanvas() {
  const canvas = document.getElementById('instructorBgCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Partículas sutiles de polvo neón
  const particles = Array.from({ length: 35 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 2 + 0.8,
    speedX: Math.random() * 0.4 - 0.2,
    speedY: Math.random() * 0.4 - 0.2,
    alpha: Math.random() * 0.4 + 0.15
  }));

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Fondo base degradado
    const grad = ctx.createRadialGradient(
      width / 2, height / 2, 50,
      width / 2, height / 2, Math.max(width, height) * 0.7
    );
    grad.addColorStop(0, '#1c1038');
    grad.addColorStop(1, '#0c0a18');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Dibujar y mover partículas
    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(168, 85, 247, ${p.alpha})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#a855f7';
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}














/* parte de recepcionista bro*/


/* ==========================================================================
   ACADEMIA RITMO - LÓGICA DE RECEPCIÓN Y BLOQUEO DE SOBRECUPO (CU-02)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof initCU01 === 'function') initCU01();
  if (typeof initBgCanvas === 'function') initBgCanvas();
  initCU02();
});

function initCU02() {
  const tallerSelect = document.getElementById('cu02-taller-select');
  const alertSobrecupo = document.getElementById('cu02-alert-sobrecupo');
  const btnInscribir = document.getElementById('cu02-btn-inscribir');
  const toast = document.getElementById('cu02-toast');

  if (!tallerSelect || !btnInscribir) return;

  function evaluarCupo() {
    const optionSelected = tallerSelect.options[tallerSelect.selectedIndex];
    const cupoDisponible = parseInt(optionSelected.dataset.cupo || '0');

    if (cupoDisponible <= 0) {
      // Bloquear botón y mostrar alerta de sobrecupo
      alertSobrecupo.classList.add('visible');
      btnInscribir.disabled = true;
      btnInscribir.classList.add('disabled');
      btnInscribir.textContent = 'Inscripción Inhabilitada (Sobrecupo)';
    } else {
      // Habilitar inscripción
      alertSobrecupo.classList.remove('visible');
      btnInscribir.disabled = false;
      btnInscribir.classList.remove('disabled');
      btnInscribir.textContent = 'Confirmar e Inscribir Alumno ➔';
    }
  }

  tallerSelect.addEventListener('change', evaluarCupo);

  btnInscribir.addEventListener('click', () => {
    if (btnInscribir.disabled) return;

    if (toast) {
      toast.classList.add('active');
      setTimeout(() => {
        toast.classList.remove('active');
      }, 3500);
    }
  });

  evaluarCupo();
}




