/* ==========================================================================
   ACADEMIA RITMO - MÓDULO DOCENTE / PASE DE LISTA (CU-01)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCU01();
  initBgCanvas();
});

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

  // Si no estamos en la vista del instructor, detenemos la inicialización de CU-01
  if (!studentListContainer && !selectGrupo) return;

  const asistenciaEstado = new Map();
  let isSyncing = false;

  // 1. Cargar la sesión y la lista de grupos del instructor
  async function cargarDatosInstructor(grupoPreseleccionado = null) {
    try {
      const res = await fetch('php/obtener_y_guardar_asistencia.php');

      if (res.status === 401) {
        window.location.href = 'log.html';
        return;
      }

      if (!res.ok) {
        throw new Error(`Error HTTP ${res.status} al consultar datos del instructor.`);
      }

      const data = await res.json();

      if (data.status === 'success') {
        // Actualizar Widget de Usuario en la Navbar
        if (data.usuario) {
          if (navAvatar) navAvatar.textContent = data.usuario.iniciales || 'IN';
          if (navName) navName.textContent = data.usuario.nombre || 'Docente';
          if (navRole) navRole.textContent = data.usuario.rol || 'Instructor';
        }

        // Renderizar opciones en el selector de clase
        if (Array.isArray(data.grupos) && data.grupos.length > 0) {
          if (selectGrupo) {
            selectGrupo.innerHTML = '';
            data.grupos.forEach((g) => {
              const opt = document.createElement('option');
              opt.value = g.id_grupo;
              const marcaCompletado = g.ya_paso_lista ? ' ✓ (Lista tomada)' : '';
              opt.textContent = `${g.nombre_clase} - ${g.salon} (${g.horario})${marcaCompletado}`;
              selectGrupo.appendChild(opt);
            });

            if (grupoPreseleccionado) {
              selectGrupo.value = String(grupoPreseleccionado);
            }
          }

          const grupoActivo = selectGrupo ? selectGrupo.value : data.grupos[0].id_grupo;
          await cargarAlumnosDeGrupo(grupoActivo);
        } else {
          if (selectGrupo) {
            selectGrupo.innerHTML = '<option value="">Sin grupos asignados</option>';
          }
          if (studentListContainer) {
            studentListContainer.innerHTML =
              '<p style="color:#94a3b8; text-align:center; padding:25px;">No tienes grupos asignados actualmente.</p>';
          }
          if (btnSync) {
            btnSync.disabled = true;
            btnSync.style.opacity = '0.5';
            btnSync.style.cursor = 'not-allowed';
          }
          actualizarContadores(0, false);
        }
      } else {
        throw new Error(data.message || 'Respuesta inválida del servidor.');
      }
    } catch (err) {
      console.error('Error al obtener datos del instructor:', err);
      if (studentListContainer) {
        studentListContainer.innerHTML =
          '<p style="color:#ef4444; text-align:center; padding:25px;">Error al conectar con la base de datos. Verifica tu sesión.</p>';
      }
      actualizarContadores(0, false);
    }
  }

  // 2. Cargar nómina de alumnos inscritos en la clase seleccionada
  async function cargarAlumnosDeGrupo(idGrupo) {
    if (!studentListContainer || !idGrupo) return;

    studentListContainer.innerHTML =
      '<p style="color:#94a3b8; text-align:center; padding:25px;">Cargando nómina del grupo...</p>';
    asistenciaEstado.clear();

    try {
      const res = await fetch(`php/obtener_y_guardar_asistencia.php?id_grupo=${encodeURIComponent(idGrupo)}`);

      if (res.status === 401) {
        window.location.href = 'log.html';
        return;
      }

      if (!res.ok) {
        throw new Error(`Error HTTP ${res.status} al cargar alumnos.`);
      }

      const data = await res.json();

      if (data.status === 'success') {
        const alumnos = Array.isArray(data.alumnos) ? data.alumnos : [];
        const yaPasoLista = Boolean(data.ya_paso_lista);
        studentListContainer.innerHTML = '';

        // Configurar estado del botón principal según si ya se pasó lista hoy
        if (btnSync) {
          if (alumnos.length === 0) {
            btnSync.disabled = true;
            btnSync.style.opacity = '0.5';
            btnSync.style.cursor = 'not-allowed';
            btnSync.textContent = 'Sin alumnos inscritos';
          } else if (yaPasoLista) {
            btnSync.disabled = true;
            btnSync.style.opacity = '0.6';
            btnSync.style.cursor = 'not-allowed';
            btnSync.textContent = '✓ Asistencia de hoy ya registrada';
          } else {
            btnSync.disabled = false;
            btnSync.style.opacity = '1';
            btnSync.style.cursor = 'pointer';
            btnSync.textContent = 'Finalizar y Sincronizar Asistencias ➔';
          }
        }

        if (alumnos.length === 0) {
          studentListContainer.innerHTML =
            '<p style="color:#94a3b8; text-align:center; padding:25px;">No hay alumnos con inscripción activa en esta clase.</p>';
          actualizarContadores(0, false);
          return;
        }

        alumnos.forEach((al) => {
          // Si ya pasó lista hoy, respetar lo guardado en BD (estado_hoy); si no, iniciar en AUSENTE
          const estadoGuardado = (al.estado_hoy || al.estado_asistencia || 'AUSENTE').toUpperCase();
          const estadoInicial = yaPasoLista && estadoGuardado === 'PRESENTE' ? 'PRESENTE' : 'AUSENTE';
          asistenciaEstado.set(al.id_alumno, estadoInicial);

          const isSolvente = (al.estado_pago || 'PENDIENTE').toUpperCase() === 'SOLVENTE';
          const pillClass = isSolvente ? 'pill-solvente' : 'pill-pendiente';
          const pillText = isSolvente ? 'Solvente' : 'Pendiente';
          const esPresente = estadoInicial === 'PRESENTE';

          const card = document.createElement('div');
          card.className = `student-card${esPresente ? ' marked' : ''}`;
          card.setAttribute('data-id-alumno', al.id_alumno);
          card.innerHTML = `
            <div>
              <div class="student-name">${escapeHtml(al.nombre_completo)}</div>
              <span class="pill ${pillClass}">${pillText}</span>
            </div>
            <button type="button" class="cu01-switch${esPresente ? ' btn-presente active' : ''}" ${
              yaPasoLista ? 'disabled style="opacity:0.75; cursor:not-allowed;"' : ''
            }>
              <span>${esPresente ? '✓' : '✕'}</span> ${esPresente ? 'Presente' : 'Falta'}
            </button>
          `;

          const btnSwitch = card.querySelector('.cu01-switch');
          if (!yaPasoLista && btnSwitch) {
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
              actualizarContadores(alumnos.length, yaPasoLista);
            });
          }

          studentListContainer.appendChild(card);
        });

        actualizarContadores(alumnos.length, yaPasoLista);
      } else {
        throw new Error(data.message || 'No se pudo obtener la nómina.');
      }
    } catch (err) {
      console.error('Error al cargar alumnos:', err);
      studentListContainer.innerHTML =
        '<p style="color:#ef4444; text-align:center; padding:25px;">Ocurrió un error al cargar la lista de alumnos.</p>';
      actualizarContadores(0, false);
    }
  }

  // 3. Actualizar contadores en vivo
  function actualizarContadores(total, yaPasoLista = false) {
    let presentes = 0;
    asistenciaEstado.forEach((val) => {
      if (val === 'PRESENTE') presentes++;
    });

    if (metaTitleElement) {
      metaTitleElement.textContent = yaPasoLista
        ? `Nómina del Grupo (${total} Alumnos · Cerrada por hoy)`
        : `Nómina del Grupo (${total} Alumnos)`;
    }
    if (counterElement) counterElement.textContent = `${presentes} / ${total} Presentes`;
  }

  // 4. Cambiar de clase desde el desplegable
  if (selectGrupo) {
    selectGrupo.addEventListener('change', (e) => {
      cargarAlumnosDeGrupo(e.target.value);
    });
  }

  // 5. Guardar asistencias en la Base de Datos (Blindado contra doble envío y reenvío diario)
  if (btnSync) {
    btnSync.addEventListener('click', async () => {
      if (btnSync.disabled || isSyncing) return;

      const idGrupo = selectGrupo ? selectGrupo.value : '';
      if (!idGrupo || asistenciaEstado.size === 0) {
        alert('No hay alumnos registrados en la lista para enviar.');
        return;
      }

      const asistenciasArr = [];
      asistenciaEstado.forEach((estado, id_alumno) => {
        asistenciasArr.push({ id_alumno, estado });
      });

      isSyncing = true;
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

        if (response.status === 401) {
          window.location.href = 'log.html';
          return;
        }

        const resData = await response.json();

        if (resData.status === 'success') {
          if (modalOverlay) {
            modalOverlay.style.display = 'flex';
            modalOverlay.classList.add('active');
          }
          // Recargar selector y lista en modo bloqueado para hoy
          await cargarDatosInstructor(idGrupo);
        } else {
          alert(resData.message || 'Error al guardar la asistencia.');
          await cargarDatosInstructor(idGrupo);
        }
      } catch (err) {
        console.error('Error al sincronizar:', err);
        alert('Error de comunicación con la base de datos.');
        btnSync.disabled = false;
        btnSync.textContent = 'Finalizar y Sincronizar Asistencias ➔';
      } finally {
        isSyncing = false;
      }
    });
  }

  // Cerrar modal de confirmación
  function cerrarModal() {
    if (!modalOverlay) return;
    modalOverlay.style.display = 'none';
    modalOverlay.classList.remove('active');
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', cerrarModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) cerrarModal();
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Inicialización
  cargarDatosInstructor();
}

/* --- CANVAS DE PARTÍCULAS LIGERAS NEÓN --- */
function initBgCanvas() {
  const canvas = document.getElementById('instructorBgCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width, height;
  let animationFrameId = null;

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
      width / 2,
      height / 2,
      50,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.7
    );
    grad.addColorStop(0, '#1c1038');
    grad.addColorStop(1, '#0c0a18');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    particles.forEach((p) => {
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

    animationFrameId = requestAnimationFrame(animate);
  }

  // Pausar animación si la pestaña no está visible para ahorrar batería
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    } else if (!document.hidden && !animationFrameId) {
      animate();
    }
  });

  animate();
}