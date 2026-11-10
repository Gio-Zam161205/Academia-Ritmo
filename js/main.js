/* ==========================================================================
<<<<<<< HEAD
   ACADEMIA RITMO - MÓDULO DOCENTE / PASE DE LISTA (CU-01)
=======
   ACADEMIA RITMO - LÓGICA DE INTERFAZ E ILUMINACIÓN LIGERA DE FONDO (CU-01)
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCU01();
  initBgCanvas();
});

<<<<<<< HEAD
/* --- LÓGICA PRINCIPAL DE ASISTENCIA Y CONEXIÓN A BD --- */
function initCU01() {
  const selectGrupo = document.getElementById('cu01-group-select');
  const studentListContainer = document.getElementById('student-list');
  const counterElement = document.getElementById('cu01-counter');
  const metaTitleElement = document.getElementById('meta-title');
  const btnSync = document.getElementById('cu01-sync-btn');
  const modalOverlay = document.getElementById('cu01-modal');
  const modalCloseBtn = document.getElementById('cu01-modal-close');

  // Elementos de la barra de sesión del docente
  const navAvatar = document.querySelector('.user-avatar');
  const navName = document.querySelector('.user-name');
  const navRole = document.querySelector('.user-role');

  const asistenciaEstado = new Map();

  // 1. Cargar la sesión y la lista de grupos del instructor
  async function cargarDatosInstructor() {
    try {
      const res = await fetch('php/obtener_y_guardar_asistencia.php');

      if (res.status === 401) {
        window.location.href = 'log.html';
        return;
      }

      const data = await res.json();

      if (data.status === 'success') {
        // Actualizar Widget de Usuario en la Navbar
        if (data.usuario) {
          if (navAvatar) navAvatar.textContent = data.usuario.iniciales || 'CM';
          if (navName) navName.textContent = data.usuario.nombre || 'Docente';
          if (navRole) navRole.textContent = data.usuario.rol || 'Instructor';
        }

        // Renderizar opciones en el selector de clase
        if (data.grupos && data.grupos.length > 0) {
          if (selectGrupo) {
            selectGrupo.innerHTML = '';
            data.grupos.forEach((g) => {
              const opt = document.createElement('option');
              opt.value = g.id_grupo;
              opt.textContent = `${g.nombre_clase} - ${g.salon} (${g.horario})`;
              selectGrupo.appendChild(opt);
            });
          }
          // Cargar los alumnos del primer grupo asignado
          cargarAlumnosDeGrupo(data.grupos[0].id_grupo);
        } else if (studentListContainer) {
          studentListContainer.innerHTML = '<p style="color:#94a3b8; text-align:center; padding:25px;">No tienes grupos asignados actualmente.</p>';
          actualizarContadores(0);
        }
      }
    } catch (err) {
      console.error('Error al obtener datos del instructor:', err);
      if (studentListContainer) {
        studentListContainer.innerHTML = '<p style="color:#ef4444; text-align:center; padding:25px;">Error al conectar con la base de datos.</p>';
      }
    }
  }

  // 2. Cargar nómina de alumnos inscritos en la clase seleccionada
  async function cargarAlumnosDeGrupo(idGrupo) {
    if (!studentListContainer) return;
    studentListContainer.innerHTML = '<p style="color:#94a3b8; text-align:center; padding:25px;">Cargando nómina del grupo...</p>';
    asistenciaEstado.clear();

    try {
      const res = await fetch(`php/obtener_y_guardar_asistencia.php?id_grupo=${idGrupo}`);
      const data = await res.json();

      if (data.status === 'success') {
        const alumnos = data.alumnos || [];
        studentListContainer.innerHTML = '';

        if (alumnos.length === 0) {
          studentListContainer.innerHTML = '<p style="color:#94a3b8; text-align:center; padding:25px;">No hay alumnos con inscripción activa en esta clase.</p>';
          actualizarContadores(0);
          return;
        }

        alumnos.forEach((al) => {
          asistenciaEstado.set(al.id_alumno, 'AUSENTE');

          const isSolvente = (al.estado_pago || 'PENDIENTE').toUpperCase() === 'SOLVENTE';
          const pillClass = isSolvente ? 'pill-solvente' : 'pill-pendiente';
          const pillText = isSolvente ? 'Solvente' : 'Pendiente';

          const card = document.createElement('div');
          card.className = 'student-card';
          card.setAttribute('data-id-alumno', al.id_alumno);
          card.innerHTML = `
            <div>
              <div class="student-name">${escapeHtml(al.nombre_completo)}</div>
              <span class="pill ${pillClass}">${pillText}</span>
            </div>
            <button type="button" class="cu01-switch">
              <span>✕</span> Falta
            </button>
          `;

          const btnSwitch = card.querySelector('.cu01-switch');
          btnSwitch.addEventListener('click', () => {
            const estadoActual = asistenciaEstado.get(al.id_alumno);
            if (estadoActual === 'AUSENTE') {
              asistenciaEstado.set(al.id_alumno, 'PRESENTE');
              btnSwitch.classList.add('btn-presente', 'active');
              btnSwitch.innerHTML = '<span>✓</span> Presente';
              card.classList.add('marked');
            } else {
              asistenciaEstado.set(al.id_alumno, 'AUSENTE');
              btnSwitch.classList.remove('btn-presente', 'active');
              btnSwitch.innerHTML = '<span>✕</span> Falta';
              card.classList.remove('marked');
            }
            actualizarContadores(alumnos.length);
          });

          studentListContainer.appendChild(card);
        });

        actualizarContadores(alumnos.length);
=======
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
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
      }
    } catch (err) {
      console.error('Error al cargar alumnos:', err);
      studentListContainer.innerHTML = '<p style="color:#ef4444; text-align:center;">Ocurrió un error al cargar la lista.</p>';
    }
  }

<<<<<<< HEAD
  // 3. Actualizar contadores en vivo
  function actualizarContadores(total) {
    let presentes = 0;
    asistenciaEstado.forEach((val) => {
      if (val === 'PRESENTE') presentes++;
    });

    if (metaTitleElement) metaTitleElement.textContent = `Nómina del Grupo (${total} Alumnos)`;
    if (counterElement) counterElement.textContent = `${presentes} / ${total} Presentes`;
  }

  // 4. Cambiar de clase desde el desplegable
  if (selectGrupo) {
    selectGrupo.addEventListener('change', (e) => {
      cargarAlumnosDeGrupo(e.target.value);
    });
  }

  // 5. Guardar asistencias en la Base de Datos
  if (btnSync) {
    btnSync.addEventListener('click', async () => {
      const idGrupo = selectGrupo ? selectGrupo.value : 0;
      if (!idGrupo || asistenciaEstado.size === 0) {
        alert('No hay alumnos registrados en la lista para enviar.');
        return;
      }

      const asistenciasArr = [];
      asistenciaEstado.forEach((estado, id_alumno) => {
        asistenciasArr.push({ id_alumno, estado });
      });

      btnSync.disabled = true;
      btnSync.textContent = 'Guardando en BD...';

      try {
        const response = await fetch('php/obtener_y_guardar_asistencia.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_grupo: idGrupo,
            asistencias: asistenciasArr
          })
        });

        const resData = await response.json();

        if (resData.status === 'success') {
          if (modalOverlay) modalOverlay.style.display = 'flex';
        } else {
          alert(resData.message || 'Error al guardar la asistencia.');
        }
      } catch (err) {
        console.error('Error al sincronizar:', err);
        alert('Error de comunicación con la base de datos.');
      } finally {
        btnSync.disabled = false;
        btnSync.textContent = 'Finalizar y Sincronizar Asistencias ➔';
      }
    });
  }

  if (modalCloseBtn && modalOverlay) {
    modalCloseBtn.addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.style.display = 'none';
      }
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Inicialización
  cargarDatosInstructor();
=======
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
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
}

/* --- CANVAS DE PARTÍCULAS LIGERAS NEÓN --- */
function initBgCanvas() {
  const canvas = document.getElementById('instructorBgCanvas');
  if (!canvas) return;
<<<<<<< HEAD
=======

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
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e

  const ctx = canvas.getContext('2d');
  let width, height;

<<<<<<< HEAD
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

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

    const grad = ctx.createRadialGradient(
      width / 2, height / 2, 50,
      width / 2, height / 2, Math.max(width, height) * 0.7
    );
    grad.addColorStop(0, '#1c1038');
    grad.addColorStop(1, '#0c0a18');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

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
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }
  animate();
}
=======
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




>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
