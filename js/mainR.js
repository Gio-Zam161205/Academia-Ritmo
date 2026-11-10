<<<<<<< HEAD
/* ==========================================================================
   ACADEMIA RITMO - LÓGICA COMPLETA DE RECEPCIÓN Y CONTROL DE AFOROS (CU-02)
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
/* ==========================================================================
   ACADEMIA RITMO - LÓGICA DE RECEPCIÓN Y CONTROL DE AFOROS (CU-02)
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
   ========================================================================== */

let listaInscripcionesLiberarCache = [];
let listaTalleresCache = [];
let idInscripcionPendienteBaja = null;
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======

/* ==========================================================================
   ACADEMIA RITMO - LÓGICA INTEGRADA DE RECEPCIÓN Y CONTROL DE AFOROS (CU-02)
   ========================================================================== */
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e

document.addEventListener('DOMContentLoaded', () => {
  initNavegacionPestanas();
  initCU02();
  cargarUsuarioSesion();
<<<<<<< HEAD
  crearModalConfirmacionHTML();
  initBgCanvas();
});

// 1. MANEJO GLOBAL DE PESTAÑAS (TABS)
=======
<<<<<<< HEAD
  crearModalConfirmacionHTML();
=======
<<<<<<< HEAD
  crearModalConfirmacionHTML();
=======
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
});

// 1. MANEJO DE PESTAÑAS (TABS)
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
function initNavegacionPestanas() {
  const botonesTab = document.querySelectorAll('.btn-tab');
  const contenidosTab = document.querySelectorAll('.tab-content');

  botonesTab.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab') || (btn.getAttribute('onclick') ? btn.getAttribute('onclick').match(/'([^']+)'/)?.[1] : null);

      botonesTab.forEach(b => b.classList.remove('active'));
      contenidosTab.forEach(c => c.classList.remove('active-tab'));

      btn.classList.add('active');
      
      if (targetId) {
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
          targetContent.classList.add('active-tab');
        }
      }
    });
  });
}

<<<<<<< HEAD
// Respaldo para llamadas inline 'onclick="abrirTab(...)"'
=======
<<<<<<< HEAD
// Función global de respaldo para llamadas inline 'onclick'
=======
<<<<<<< HEAD
// Función global de respaldo para llamadas inline 'onclick'
=======
// Función global de respaldo para llamadas inline 'onclick' si existen en HTML
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
function abrirTab(idTab, btn) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active-tab'));
  document.querySelectorAll('.btn-tab').forEach(b => b.classList.remove('active'));
  
  const target = document.getElementById(idTab);
  if (target) target.classList.add('active-tab');
  if (btn) btn.classList.add('active');
}

<<<<<<< HEAD
// 2. CREACIÓN DEL MODAL PERSONALIZADO NEÓN CON ANIMACIÓN DE ÉXITO (PALOMITA VERDE)
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
// 2. MODAL PERSONALIZADO CON ANIMACIÓN DE CONFIRMACIÓN (PALOMITA VERDE)
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
function crearModalConfirmacionHTML() {
  if (document.getElementById('modal-confirm-baja')) return;

  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'modal-confirm-baja';
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(8, 7, 18, 0.85);
    backdrop-filter: blur(12px);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    animation: fadeIn 0.2s ease;
  `;

  modalOverlay.innerHTML = `
    <div style="
      background: #120f24;
      border: 1px solid rgba(239, 68, 68, 0.35);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 25px rgba(239, 68, 68, 0.2);
      border-radius: 18px;
      padding: 28px;
      max-width: 440px;
      width: 90%;
      color: #f8fafc;
      font-family: 'Plus Jakarta Sans', sans-serif;
      position: relative;
    ">
      <!-- FORMULARIO DE CONFIRMACIÓN -->
      <div id="modal-content-body">
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 16px;">
          <div style="
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.3);
            width: 44px; height: 44px;
            border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            font-size: 20px;
          ">⚠️</div>
          <div>
            <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #ffffff;">Confirmación de Baja</h3>
            <span style="font-size: 12px; font-weight: 600; color: #ef4444;">Acción irreversible</span>
          </div>
        </div>

        <p style="font-size: 13.5px; color: #cbd5e1; margin-bottom: 10px; line-height: 1.5;">
          ¿Estás seguro de cancelar la inscripción del alumno:
        </p>

        <div id="modal-alumno-nombre" style="
          font-weight: 700;
          font-size: 15px;
          color: #c084fc;
          background: rgba(168, 85, 247, 0.12);
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid rgba(168, 85, 247, 0.3);
          margin-bottom: 16px;
          word-break: break-word;
        ">--</div>

        <p style="font-size: 12px; color: #94a3b8; margin-bottom: 24px; line-height: 1.4;">
          Esta acción cambiará el estado a <strong>CANCELADO</strong> y liberará el cupo en la sala inmediatamente.
        </p>

        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <button id="btn-modal-cancelar" style="
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #cbd5e1;
            padding: 11px 20px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            font-size: 13px;
            transition: all 0.2s ease;
          ">Cancelar</button>
          
          <button id="btn-modal-confirmar" style="
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            border: none;
            color: #fff;
            padding: 11px 22px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 700;
            font-size: 13.5px;
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
            display: flex; align-items: center; gap: 8px;
            transition: all 0.2s ease;
          ">
            <span id="txt-btn-modal-confirmar">Confirmar Baja ➔</span>
          </button>
        </div>
      </div>

      <!-- ANIMACIÓN DE ÉXITO (PALOMITA VERDE) -->
      <div id="modal-success-state" style="display: none; text-align: center; padding: 15px 10px;">
        <div style="
          width: 68px; height: 68px;
          background: rgba(34, 197, 94, 0.15);
          border: 2px solid #22c55e;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px auto;
          box-shadow: 0 0 25px rgba(34, 197, 94, 0.4);
          animation: popSuccess 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        ">
          <span style="font-size: 34px; color: #22c55e; font-weight: 900; line-height: 1;">✓</span>
        </div>
        <h4 style="margin: 0 0 4px 0; font-size: 17px; font-weight: 800; color: #ffffff;">¡Baja Procesada!</h4>
        <p style="font-size: 12.5px; color: #86efac; margin: 0;">Inscripción cancelada y cupo liberado.</p>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes popSuccess {
      0% { transform: scale(0) rotate(-45deg); opacity: 0; }
      75% { transform: scale(1.15) rotate(5deg); opacity: 1; }
      100% { transform: scale(1) rotate(0deg); }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(modalOverlay);

  document.getElementById('btn-modal-cancelar').addEventListener('click', cerrarModal);
}

function cerrarModal() {
  const modalOverlay = document.getElementById('modal-confirm-baja');
  if (modalOverlay) {
    modalOverlay.style.display = 'none';
    document.getElementById('modal-content-body').style.display = 'block';
    document.getElementById('modal-success-state').style.display = 'none';
  }
  idInscripcionPendienteBaja = null;
}

<<<<<<< HEAD
// 3. RECUPERAR DATOS DE SESIÓN DEL USUARIO LOGUEADO
=======
// 3. RECUPERAR DATOS DE LA SESIÓN DEL USUARIO
<<<<<<< HEAD
=======
=======
// 2. RECUPERAR DATOS DE LA SESIÓN DEL USUARIO
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
async function cargarUsuarioSesion() {
  const avatarElem = document.getElementById('nav-user-avatar');
  const nameElem = document.getElementById('nav-user-name');
  const roleElem = document.getElementById('nav-user-role');

  if (!nameElem) return;

  try {
    const res = await fetch('php/obtener_usuario_sesion.php');
    if (res.status === 401) {
      window.location.href = 'log.html';
      return;
    }

    const data = await res.json();
    if (data.status === 'success') {
      if (avatarElem) avatarElem.textContent = data.iniciales;
      if (nameElem) nameElem.textContent = data.nombre;
      if (roleElem) roleElem.textContent = data.rol;
    }
  } catch (e) {
    console.error('Error al recuperar datos del usuario:', e);
  }
}

<<<<<<< HEAD
// 4. MÓDULO PRINCIPAL DE RECEPCIÓN (CU-02)
=======
<<<<<<< HEAD
// 4. MÓDULO PRINCIPAL DE RECEPCIÓN (CU-02)
=======
<<<<<<< HEAD
// 4. MÓDULO PRINCIPAL DE RECEPCIÓN (CU-02)
=======
// 3. MÓDULO PRINCIPAL DE RECEPCIÓN
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
function initCU02() {
  const tallerSelect = document.getElementById('cu02-taller-select');
  const selectLiberar = document.getElementById('select-liberar');
  const selectPendientes = document.getElementById('select-alumnos-pendientes');
  const instructorSelect = document.getElementById('nuevo-instructor-select');
  const alertSobrecupo = document.getElementById('cu02-alert-sobrecupo');
<<<<<<< HEAD
  const inputFiltroLiberar = document.getElementById('input-filtro-liberar');
=======
<<<<<<< HEAD
  const inputFiltroLiberar = document.getElementById('input-filtro-liberar');
=======
<<<<<<< HEAD
  const inputFiltroLiberar = document.getElementById('input-filtro-liberar');
=======
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
  
  const btnInscribir = document.getElementById('cu02-btn-inscribir');
  const btnPagoAdeudo = document.getElementById('btn-registrar-pago-adeudo');
  const btnCrearGrupo = document.getElementById('btn-crear-grupo');
  const btnLiberarCupo = document.getElementById('btn-liberar-cupo');
  const toast = document.getElementById('cu02-toast');

  function mostrarToast(msg) {
    if (toast) {
      toast.textContent = '✓ ' + msg;
      toast.classList.add('active');
      setTimeout(() => toast.classList.remove('active'), 3500);
    }
  }

  // A. CARGA CENTRALIZADA Y ACTUALIZACIÓN EN TIEMPO REAL
  async function cargarAforosCentrales() {
    try {
      // 1. Obtener Aforos
      const resAforos = await fetch('php/obtener_aforos.php');
      if (resAforos.ok) {
        const dataAforos = await resAforos.json();
        if (dataAforos.status === 'success') {
<<<<<<< HEAD
          listaTalleresCache = dataAforos.data || [];
          renderizarTablaAulas(listaTalleresCache);
          renderizarOpcionesSelect(listaTalleresCache);
=======
<<<<<<< HEAD
          listaTalleresCache = dataAforos.data || [];
          renderizarTablaAulas(listaTalleresCache);
          renderizarOpcionesSelect(listaTalleresCache);
=======
<<<<<<< HEAD
          listaTalleresCache = dataAforos.data || [];
          renderizarTablaAulas(listaTalleresCache);
          renderizarOpcionesSelect(listaTalleresCache);
=======
          renderizarTablaAulas(dataAforos.data);
          renderizarOpcionesSelect(dataAforos.data);
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
        }
      }

      // 2. Obtener Instructores y Grupos
      const resGrupos = await fetch('php/obtener_y_crear_grupos.php');
      if (resGrupos.ok) {
        const dataGrupos = await resGrupos.json();
        if (dataGrupos.status === 'success' && dataGrupos.instructores) {
          renderizarInstructoresSelect(dataGrupos.instructores);
        }
      }

<<<<<<< HEAD
      // 3. Obtener Inscripciones Activas para Liberar Cupo
      await cargarInscripcionesParaLiberar();
=======
      // 3. Obtener Inscripciones para Liberar Cupo
<<<<<<< HEAD
      await cargarInscripcionesParaLiberar();
=======
<<<<<<< HEAD
      await cargarInscripcionesParaLiberar();
=======
      const resInsc = await fetch('php/liberar_cupo.php?accion=listar');
      if (resInsc.ok) {
        const dataInsc = await resInsc.json();
        if (dataInsc.status === 'success') {
          renderizarListaLiberar(dataInsc.data);
        }
      }
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e

      // 4. Obtener Alumnos Pendientes de Pago
      await cargarAlumnosPendientes();

    } catch (e) {
      console.error('Error al conectar con la base de datos:', e);
    }
  }

<<<<<<< HEAD
  // B. RENDERIZAR TABLA DE AFOROS EN VIVO
=======
  // B. RENDERIZAR TABLA DE AFOROS
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
  function renderizarTablaAulas(grupos) {
    const tbody = document.querySelector('.desk-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (!grupos || grupos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 1.5rem;">No hay talleres registrados.</td></tr>';
      return;
    }

    grupos.forEach((grupo) => {
      const ocu = parseInt(grupo.ocupacion_actual || 0);
      const max = parseInt(grupo.cupo_maximo || 1);
      const lib = parseInt(grupo.cupo_disponible || 0);
      const pct = Math.min(Math.round((ocu / max) * 100), 100);
      const lleno = lib <= 0;
      const instructor = grupo.nombre_instructor || 'Sin Asignar';
<<<<<<< HEAD
      const salon = grupo.salon || 'Sala A';
      const horario = grupo.horario || '18:00 - 19:30';
=======
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <strong class="class-name">${grupo.nombre_clase}</strong><br>
<<<<<<< HEAD
          <small class="class-sub">🏛️ ${salon} · ⏰ ${horario} · Prof. ${instructor}</small>
=======
          <small class="class-sub">Prof. ${instructor} · Cupo Máx: ${max}</small>
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
        </td>
        <td>${max}</td>
        <td>
          <div class="progress-info"><span>${ocu} / ${max} (${pct}%)</span></div>
          <div class="progress-track"><div class="progress-bar ${lleno ? 'progress-bar-red' : 'progress-bar-indigo'}" style="width: ${pct}%;"></div></div>
        </td>
        <td><strong class="seats-free ${lleno ? 'danger' : 'primary'}">${lib}</strong></td>
        <td><span class="pill ${lleno ? 'pill-lleno' : 'pill-solvente'}">${lleno ? 'Lleno' : 'Disponible'}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

<<<<<<< HEAD
  // C. RENDERIZAR SELECTORES DINÁMICOS
=======
  // C. RENDERIZAR SELECTORES
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
  function renderizarInstructoresSelect(instructores) {
    if (!instructorSelect) return;
    instructorSelect.innerHTML = '';

    if (!instructores || instructores.length === 0) {
      instructorSelect.innerHTML = '<option value="">No hay instructores registrados en la BD</option>';
      return;
    }

    instructores.forEach(inst => {
      instructorSelect.innerHTML += `<option value="${inst.id_instructor}">${inst.nombre_completo} (${inst.especialidad})</option>`;
    });
  }

  function renderizarOpcionesSelect(grupos) {
    if (!tallerSelect) return;
    tallerSelect.innerHTML = '';
    grupos.forEach(g => {
      const lib = parseInt(g.cupo_disponible || 0);
      const costo = parseFloat(g.costo_cuota || 0);
      tallerSelect.innerHTML += `<option value="${g.id_grupo}" data-cupo="${lib}" data-costo="${costo}">${g.nombre_clase} (${lib} cupos libres) - $${costo.toFixed(2)}</option>`;
    });
    evaluarCupo();
    actualizarMontoCuota();
  }

<<<<<<< HEAD
  // Cargar lista para Liberar Cupo
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
  // Búsqueda y Filtrado en Tiempo Real para Liberar Cupo
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
  async function cargarInscripcionesParaLiberar() {
    try {
      const resInsc = await fetch('php/liberar_cupo.php?accion=listar');
      if (resInsc.ok) {
        const dataInsc = await resInsc.json();
        if (dataInsc.status === 'success') {
          listaInscripcionesLiberarCache = dataInsc.data || [];
          renderizarListaLiberar(listaInscripcionesLiberarCache);
        }
      }
    } catch (e) {
      console.error('Error al obtener lista para liberar:', e);
    }
  }

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
  function renderizarListaLiberar(inscripciones) {
    if (!selectLiberar) return;
    selectLiberar.innerHTML = '';

    if (!inscripciones || inscripciones.length === 0) {
      selectLiberar.innerHTML = '<option value="" disabled selected>No hay inscripciones activas para liberar</option>';
      return;
    }

    selectLiberar.innerHTML = '<option value="" disabled selected>Selecciona al alumno a dar de baja...</option>';
    inscripciones.forEach(i => {
      const alumnoNombre = i.alumno || i.alumno_nombre || 'Alumno Registrado';
<<<<<<< HEAD
      const opt = document.createElement('option');
      opt.value = i.id_inscripcion;
      opt.textContent = `${alumnoNombre} - (${i.nombre_clase})`;
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
      const opt = document.createElement('option');
      opt.value = i.id_inscripcion;
      opt.textContent = `${alumnoNombre} (${i.nombre_clase})`;
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
      selectLiberar.appendChild(opt);
    });
  }

<<<<<<< HEAD
  // Filtro de búsqueda rápida en tiempo real para Liberar Cupo
=======
  // Evento Input para filtrar dinámicamente el <select>
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
  if (inputFiltroLiberar) {
    inputFiltroLiberar.addEventListener('input', (e) => {
      const texto = e.target.value.toLowerCase().trim();
      
      const filtrados = listaInscripcionesLiberarCache.filter(item => {
        const alumno = (item.alumno || item.alumno_nombre || '').toLowerCase();
        const clase = (item.nombre_clase || '').toLowerCase();
        return alumno.includes(texto) || clase.includes(texto);
      });

      renderizarListaLiberar(filtrados);
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
      selectLiberar.innerHTML += `<option value="${i.id_inscripcion}">ID #${i.id_inscripcion} - ${alumnoNombre} (${i.nombre_clase})</option>`;
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
    });
  }

  // D. GESTIÓN DE ALUMNOS PENDIENTES (COBRAR ADEUDOS)
  async function cargarAlumnosPendientes() {
    if (!selectPendientes) return;
    try {
      const res = await fetch('php/obtener_pendientes.php');
      if (!res.ok) return;

      const result = await res.json();
      selectPendientes.innerHTML = '';

<<<<<<< HEAD
      if (result.status === 'success' && result.data && result.data.length > 0) {
=======
      if (result.status === 'success' && result.data.length > 0) {
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
        selectPendientes.innerHTML = '<option value="" disabled selected>Selecciona un alumno pendiente...</option>';
        result.data.forEach(p => {
          selectPendientes.innerHTML += `<option value="${p.id_alumno}" data-grupo="${p.id_grupo}" data-monto="${p.adeudo_pendiente}" data-clase="${p.nombre_clase}">
            ${p.alumno_nombre} - Adeuda: $${parseFloat(p.adeudo_pendiente).toFixed(2)} (${p.nombre_clase})
          </option>`;
        });
      } else {
        selectPendientes.innerHTML = '<option disabled selected>No hay alumnos pendientes de pago 👍</option>';
        const infoBox = document.getElementById('info-adeudo-box');
        if (infoBox) infoBox.style.display = 'none';
      }
    } catch (e) {
      console.error('Error al cargar pendientes:', e);
    }
  }

  if (selectPendientes) {
    selectPendientes.addEventListener('change', () => {
      const opt = selectPendientes.options[selectPendientes.selectedIndex];
      if (opt && opt.dataset.monto) {
        const montoElem = document.getElementById('monto-adeudo-display');
        const conceptoElem = document.getElementById('concepto-adeudo-display');
        const infoBox = document.getElementById('info-adeudo-box');

        if (montoElem) montoElem.textContent = parseFloat(opt.dataset.monto).toFixed(2);
        if (conceptoElem) conceptoElem.textContent = 'Cuota de ' + opt.dataset.clase;
        if (infoBox) infoBox.style.display = 'block';
      }
    });
  }

  // E. EVALUACIÓN Y ACTUALIZACIÓN DE AFOROS/CUOTAS
  function actualizarMontoCuota() {
    if (!tallerSelect || !tallerSelect.options.length) return;
    const opt = tallerSelect.options[tallerSelect.selectedIndex];
    const displayElement = document.getElementById('monto-cuota-display');
    if (opt && opt.dataset.costo && displayElement) {
      displayElement.textContent = parseFloat(opt.dataset.costo).toFixed(2);
    }
  }

  function evaluarCupo() {
    if (!tallerSelect || !tallerSelect.options.length) return;
    const opt = tallerSelect.options[tallerSelect.selectedIndex];
    const cupo = parseInt(opt.dataset.cupo || '0');

    if (cupo <= 0) {
      if (alertSobrecupo) alertSobrecupo.classList.add('visible');
      if (btnInscribir) {
        btnInscribir.disabled = true;
        btnInscribir.classList.add('disabled');
        btnInscribir.textContent = 'Inscripción Inhabilitada (Sobrecupo)';
      }
    } else {
      if (alertSobrecupo) alertSobrecupo.classList.remove('visible');
      if (btnInscribir) {
        btnInscribir.disabled = false;
        btnInscribir.classList.remove('disabled');
<<<<<<< HEAD
        btnInscribir.textContent = 'Completar Registro y Pago ➔';
=======
<<<<<<< HEAD
        btnInscribir.textContent = 'Completar Registro y Pago ➔';
=======
<<<<<<< HEAD
        btnInscribir.textContent = 'Completar Registro y Pago ➔';
=======
        btnInscribir.textContent = 'Completar Registro ➔';
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
      }
    }
  }

  if (tallerSelect) {
    tallerSelect.addEventListener('change', () => {
      evaluarCupo();
      actualizarMontoCuota();
    });
  }

<<<<<<< HEAD
  // F. EVENTO: INSCRIBIR ALUMNO Y COBRAR PAGO INICIAL
=======
  // F. EVENTO: INSCRIBIR Y COBRAR INICIAL
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
  if (btnInscribir) {
    btnInscribir.addEventListener('click', async () => {
      if (btnInscribir.disabled) return;

      const nombre = document.getElementById('alumno-nombre')?.value.trim();
      const apellidos = document.getElementById('alumno-apellidos')?.value.trim();
      const telefono = document.getElementById('alumno-telefono')?.value.trim();
      const idGrupo = tallerSelect ? tallerSelect.value : null;
      const chkPago = document.getElementById('pago-confirmado');
      const registrarPago = chkPago && chkPago.checked ? '1' : '0';

      if (!nombre || !apellidos || !idGrupo) {
<<<<<<< HEAD
        alert('Por favor ingresa el nombre, apellidos y selecciona un taller.');
=======
<<<<<<< HEAD
        alert('Por favor ingresa el nombre, apellidos y selecciona un taller.');
=======
<<<<<<< HEAD
        alert('Por favor ingresa el nombre, apellidos y selecciona un taller.');
=======
        alert('Ingresa el nombre, apellidos y selecciona un taller.');
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
        return;
      }

      const fd = new FormData();
      fd.append('nombre', nombre);
      fd.append('apellidos', apellidos);
      fd.append('telefono', telefono);
      fd.append('id_grupo', idGrupo);
      fd.append('registrar_pago', registrarPago);

      try {
        btnInscribir.disabled = true;
        btnInscribir.textContent = 'Procesando...';

        const res = await fetch('php/inscribir_alumno.php', { method: 'POST', body: fd });
        const result = await res.json();

        if (result.status === 'success') {
          mostrarToast(result.message);
          document.getElementById('alumno-nombre').value = '';
          document.getElementById('alumno-apellidos').value = '';
          if (document.getElementById('alumno-telefono')) document.getElementById('alumno-telefono').value = '';
          await cargarAforosCentrales();
        } else {
          alert(result.message);
          evaluarCupo();
        }
      } catch (e) {
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
        console.error('Error al inscribir:', e);
        alert('Error al procesar el registro.');
        evaluarCupo();
      } finally {
        btnInscribir.disabled = false;
        btnInscribir.textContent = 'Completar Registro y Pago ➔';
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
        console.error(e);
        alert('Error al procesar el registro.');
        evaluarCupo();
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
      }
    });
  }

<<<<<<< HEAD
  // G. EVENTO: REGISTRAR PAGO DE ADEUDO POSTERIOR
=======
  // G. EVENTO: REGISTRAR PAGO POSTERIOR
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
  if (btnPagoAdeudo) {
    btnPagoAdeudo.addEventListener('click', async () => {
      const opt = selectPendientes.options[selectPendientes.selectedIndex];
      if (!opt || !opt.value) {
        alert('Por favor selecciona un alumno con adeudo.');
        return;
      }

      const fd = new FormData();
      fd.append('id_alumno', opt.value);
      fd.append('id_grupo', opt.dataset.grupo);
      fd.append('monto', opt.dataset.monto);

      try {
        btnPagoAdeudo.disabled = true;
        btnPagoAdeudo.textContent = 'Procesando...';

        const res = await fetch('php/registrar_pago_adeudo.php', { method: 'POST', body: fd });
        const result = await res.json();

        if (result.status === 'success') {
          mostrarToast(result.message);
          await cargarAforosCentrales();
        } else {
          alert(result.message);
        }
      } catch (e) {
        console.error(e);
        alert('Error al registrar el pago.');
      } finally {
        btnPagoAdeudo.disabled = false;
        btnPagoAdeudo.textContent = 'Registrar Pago y Marcar Solvente ➔';
      }
    });
  }

<<<<<<< HEAD
  // H. EVENTO: CREAR NUEVO TALLER CON SALÓN, HORARIO E INSTRUCTOR (PROTEGIDO CONTRA ENVÍOS DOBLES)
  // Guardar nuevo grupo/taller asignando salón, horario e instructor
=======
  // H. EVENTO: CREAR NUEVO GRUPO / TALLER
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
  if (btnCrearGrupo) {
    btnCrearGrupo.addEventListener('click', async (e) => {
      e.preventDefault();

      const nombreInput = document.getElementById('nuevo-nombre-clase');
<<<<<<< HEAD
      const salonInput = document.getElementById('nuevo-salon');
      const horarioInput = document.getElementById('nuevo-horario');
=======
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
      const cupoInput = document.getElementById('nuevo-cupo-maximo');
      const costoInput = document.getElementById('nuevo-costo-cuota');
      const instructorSel = document.getElementById('nuevo-instructor-select');

      const nombre = nombreInput ? nombreInput.value.trim() : '';
<<<<<<< HEAD
      const salon = salonInput ? salonInput.value.trim() : 'Sala A';
      const horario = horarioInput ? horarioInput.value.trim() : '18:00 - 19:30';
=======
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
      const cupo = cupoInput ? cupoInput.value : '';
      const costo = costoInput ? costoInput.value : '';
      const idInstructor = instructorSel && instructorSel.value ? instructorSel.value : 1;

      if (!nombre || !cupo || !costo) {
<<<<<<< HEAD
        alert('Por favor completa los datos del nuevo grupo.');
=======
        alert('Por favor completa todos los datos del nuevo grupo.');
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
        return;
      }

      btnCrearGrupo.disabled = true;
      btnCrearGrupo.textContent = 'Guardando...';

      const formData = new FormData();
      formData.append('nombre_clase', nombre);
<<<<<<< HEAD
      formData.append('salon', salon);
      formData.append('horario', horario);
=======
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
      formData.append('cupo_maximo', cupo);
      formData.append('costo_cuota', costo);
      formData.append('tipo_clase', 'Taller');
      formData.append('id_instructor', idInstructor);

      try {
        const response = await fetch('php/obtener_y_crear_grupos.php', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();

        if (result.status === 'success') {
          mostrarToast(result.message);
          const form = document.getElementById('form-nuevo-grupo');
          if (form) form.reset();
          await cargarAforosCentrales();
        } else {
          alert(result.message);
        }
      } catch (e) {
        console.error('Error al registrar grupo:', e);
        alert('Error de conexión al servidor.');
      } finally {
        btnCrearGrupo.disabled = false;
<<<<<<< HEAD
        btnCrearGrupo.textContent = 'Guardar Taller, Salón y Horario';
      }
    });
  }
  // I. EVENTO: ABRIR MODAL AL CLICKEAR "LIBERAR ESPACIO"
  if (btnLiberarCupo) {
    btnLiberarCupo.addEventListener('click', () => {
=======
        btnCrearGrupo.textContent = 'Guardar Taller y Asignar Instructor';
      }
    });
  }

<<<<<<< HEAD
  // I. EVENTO: ABRIR MODAL AL CLICKEAR "LIBERAR ESPACIO"
  if (btnLiberarCupo) {
    btnLiberarCupo.addEventListener('click', () => {
=======
<<<<<<< HEAD
  // I. EVENTO: ABRIR MODAL AL CLICKEAR "LIBERAR ESPACIO"
  if (btnLiberarCupo) {
    btnLiberarCupo.addEventListener('click', () => {
=======
  // I. EVENTO: LIBERAR CUPO (BAJA DE ALUMNO)
  if (btnLiberarCupo) {
    btnLiberarCupo.addEventListener('click', async () => {
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
      if (!selectLiberar || !selectLiberar.value) {
        alert('Selecciona una inscripción activa para liberar.');
        return;
      }
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e

      const textoSeleccionado = selectLiberar.options[selectLiberar.selectedIndex]?.textContent;
      idInscripcionPendienteBaja = selectLiberar.value;

      const modal = document.getElementById('modal-confirm-baja');
      const textElem = document.getElementById('modal-alumno-nombre');
      const btnConfirmar = document.getElementById('btn-modal-confirmar');
      const txtBtnConfirmar = document.getElementById('txt-btn-modal-confirmar');

      if (modal && textElem) {
        textElem.textContent = textoSeleccionado;
        
<<<<<<< HEAD
=======
        // Resetear vista del modal
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
        document.getElementById('modal-content-body').style.display = 'block';
        document.getElementById('modal-success-state').style.display = 'none';
        
        if (btnConfirmar) btnConfirmar.disabled = false;
        if (txtBtnConfirmar) txtBtnConfirmar.textContent = 'Confirmar Baja ➔';

        modal.style.display = 'flex';
      }
    });
  }

<<<<<<< HEAD
  // PROCESAR PROCESO DE CONFIRMACIÓN DE BAJA DENTRO DEL MODAL
=======
  // CONFIRMACIÓN DE BAJA DENTRO DEL MODAL (PROCESANDO -> PALOMITA VERDE Y CIERRE AUTOMÁTICO)
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
  document.addEventListener('click', async (e) => {
    const btnConfirmar = e.target.closest('#btn-modal-confirmar');
    if (btnConfirmar) {
      if (!idInscripcionPendienteBaja) return;

      const txtBtnConfirmar = document.getElementById('txt-btn-modal-confirmar');
      const fd = new FormData();
      fd.append('id_inscripcion', idInscripcionPendienteBaja);

      try {
        btnConfirmar.disabled = true;
        if (txtBtnConfirmar) txtBtnConfirmar.textContent = 'Procesando...';
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
      
      const fd = new FormData();
      fd.append('id_inscripcion', selectLiberar.value);

      try {
        btnLiberarCupo.disabled = true;
        btnLiberarCupo.textContent = 'Procesando...';
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e

        const res = await fetch('php/liberar_cupo.php', { method: 'POST', body: fd });
        const result = await res.json();

        if (result.status === 'success') {
<<<<<<< HEAD
          // 1. Mostrar pantalla de éxito con palomita verde animada
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
          // 1. Mostrar pantalla de éxito con la palomita verde animada
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
          document.getElementById('modal-content-body').style.display = 'none';
          document.getElementById('modal-success-state').style.display = 'block';

          if (inputFiltroLiberar) inputFiltroLiberar.value = '';
          await cargarAforosCentrales();

<<<<<<< HEAD
          // 2. Cierre automático tras 800ms
=======
          // 2. Cierre automático tras 800ms sin requerir clic manual
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
          setTimeout(() => {
            cerrarModal();
          }, 800);

        } else {
          alert(result.message);
          btnConfirmar.disabled = false;
          if (txtBtnConfirmar) txtBtnConfirmar.textContent = 'Confirmar Baja ➔';
        }
      } catch (err) {
        console.error(err);
        alert('Error al liberar espacio.');
        btnConfirmar.disabled = false;
        if (txtBtnConfirmar) txtBtnConfirmar.textContent = 'Confirmar Baja ➔';
      }
    }
  });
<<<<<<< HEAD

  // Carga inicial al arrancar el módulo
  cargarAforosCentrales();
}

// 5. CANVAS DE PARTÍCULAS AL FONDO (ANIMACIÓN NEÓN)
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
=======
<<<<<<< HEAD
=======
=======
          mostrarToast(result.message);
          await cargarAforosCentrales();
        } else {
          alert(result.message);
        }
      } catch (e) {
        console.error(e);
        alert('Error al liberar espacio.');
      } finally {
        btnLiberarCupo.disabled = false;
        btnLiberarCupo.textContent = 'Liberar Espacio';
      }
    });
  }
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d

  // Carga inicial al arrancar el módulo
  cargarAforosCentrales();
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
}