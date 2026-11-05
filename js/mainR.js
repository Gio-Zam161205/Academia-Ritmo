/* ==========================================================================
   ACADEMIA RITMO - LÓGICA DE RECEPCIÓN, PESTAÑAS Y CONTROL DE AFOROS (CU-02)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof initBgCanvas === 'function') initBgCanvas();
  cargarUsuarioSesion();
  initCU02();
});

// 1. Manejo Global de Pestañas (Tabs)
function abrirTab(tabId, btnElement) {
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach(tab => tab.classList.remove('active-tab'));

  const buttons = document.querySelectorAll('.btn-tab');
  buttons.forEach(btn => btn.classList.remove('active'));

  const targetTab = document.getElementById(tabId);
  if (targetTab) {
    targetTab.classList.add('active-tab');
  }
  if (btnElement) {
    btnElement.classList.add('active');
  }
}

// 2. Cargar sesión de usuario en el Navbar
async function cargarUsuarioSesion() {
  const avatarElem = document.getElementById('nav-user-avatar');
  const nameElem = document.getElementById('nav-user-name');
  const roleElem = document.getElementById('nav-user-role');

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
    console.error('Error al cargar datos del usuario:', e);
  }
}

// 3. Módulo Principal de Recepción CU-02
function initCU02() {
  const tallerSelect = document.getElementById('cu02-taller-select');
  const alertSobrecupo = document.getElementById('cu02-alert-sobrecupo');
  const btnInscribir = document.getElementById('cu02-btn-inscribir');
  const btnCrearGrupo = document.getElementById('btn-crear-grupo');
  const btnLiberar = document.getElementById('btn-liberar-cupo');
  const toast = document.getElementById('cu02-toast');

  let talleresDataGlobal = [];

  // Función para mostrar notificaciones Toast
  function mostrarToast(mensaje) {
    if (!toast) return;
    toast.textContent = mensaje;
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, 3500);
  }

  // Cargar Aforos y Grupos en tiempo real
  async function cargarAforosCentrales() {
    try {
      const responseAforos = await fetch('php/obtener_aforos.php');
      if (!responseAforos.ok) throw new Error(`HTTP ${responseAforos.status}`);
      const resultAforos = await responseAforos.json();

      if (resultAforos.status === 'success') {
        talleresDataGlobal = resultAforos.data;
        renderizarTablaAulas(talleresDataGlobal);
        renderizarOpcionesSelect(talleresDataGlobal);
      }

      // Cargar lista de inscripciones activas para la pestaña de liberar cupo
      cargarInscripcionesActivas();
      // Cargar lista de instructores
      cargarInstructoresSelect();
    } catch (error) {
      console.error('Error al conectar con aforos:', error);
    }
  }

  // Renderizar Tabla de Disponibilidad
  function renderizarTablaAulas(grupos) {
    const tbody = document.querySelector('.desk-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (grupos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 1.5rem;">No hay talleres registrados.</td></tr>';
      return;
    }

    grupos.forEach((grupo) => {
      const ocupacion = parseInt(grupo.ocupacion_actual || 0);
      const maximo = parseInt(grupo.cupo_maximo || 1);
      const libres = parseInt(grupo.cupo_disponible || 0);
      const porcentaje = Math.min(Math.round((ocupacion / maximo) * 100), 100);
      const esLleno = libres <= 0;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <strong class="class-name">${grupo.nombre_clase}</strong><br>
          <small class="class-sub">Taller Ritmo · Costo: $${grupo.costo_cuota || 0}</small>
        </td>
        <td>${maximo}</td>
        <td>
          <div class="progress-info">
            <span>${ocupacion} / ${maximo} (${porcentaje}%)</span>
          </div>
          <div class="progress-track">
            <div class="progress-bar ${esLleno ? 'progress-bar-red' : 'progress-bar-indigo'}" style="width: ${porcentaje}%;"></div>
          </div>
        </td>
        <td><strong class="seats-free ${esLleno ? 'danger' : 'primary'}">${libres}</strong></td>
        <td><span class="pill ${esLleno ? 'pill-lleno' : 'pill-solvente'}">${esLleno ? 'Lleno' : 'Disponible'}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Renderizar Select de Talleres
  function renderizarOpcionesSelect(grupos) {
    if (!tallerSelect) return;
    tallerSelect.innerHTML = '';

    grupos.forEach((grupo) => {
      const option = document.createElement('option');
      option.value = grupo.id_grupo;
      option.dataset.cupo = grupo.cupo_disponible;
      option.dataset.costo = grupo.costo_cuota || 0;
      option.textContent = `${grupo.nombre_clase} (Disponibles: ${grupo.cupo_disponible})`;
      tallerSelect.appendChild(option);
    });

    evaluarCupo();
  }

  // Evaluar bloqueo por sobrecupo
  function evaluarCupo() {
    if (!tallerSelect || !tallerSelect.options.length) return;

    const optionSelected = tallerSelect.options[tallerSelect.selectedIndex];
    const cupoDisponible = parseInt(optionSelected.dataset.cupo || '0');
    const costoCuota = parseFloat(optionSelected.dataset.costo || '0');

    const displayCosto = document.getElementById('monto-cuota-display');
    if (displayCosto) displayCosto.textContent = costoCuota.toFixed(2);

    if (cupoDisponible <= 0) {
      if (alertSobrecupo) alertSobrecupo.classList.add('visible');
      if (btnInscribir) {
        btnInscribir.disabled = true;
        btnInscribir.classList.add('disabled');
        btnInscribir.textContent = 'Bloqueo de Sobrecupo Activo 🚫';
      }
    } else {
      if (alertSobrecupo) alertSobrecupo.classList.remove('visible');
      if (btnInscribir) {
        btnInscribir.disabled = false;
        btnInscribir.classList.remove('disabled');
        btnInscribir.textContent = 'Completar Registro y Pago ➔';
      }
    }
  }

  // Evento Registrar e Inscribir Alumno
  if (btnInscribir) {
    btnInscribir.addEventListener('click', async () => {
      if (btnInscribir.disabled) return;

      const nombre = document.getElementById('alumno-nombre')?.value.trim();
      const apellidos = document.getElementById('alumno-apellidos')?.value.trim();
      const telefono = document.getElementById('alumno-telefono')?.value.trim();
      const idGrupo = tallerSelect.value;
      const pagoConfirmado = document.getElementById('pago-confirmado')?.checked ? 1 : 0;

      if (!nombre || !apellidos) {
        alert('Por favor ingresa el nombre y los apellidos del alumno.');
        return;
      }

      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('apellidos', apellidos);
      formData.append('telefono', telefono);
      formData.append('id_grupo', idGrupo);
      formData.append('pago_confirmado', pagoConfirmado);

      try {
        btnInscribir.disabled = true;
        btnInscribir.textContent = 'Procesando...';

        const res = await fetch('php/inscribir_alumno.php', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();

        if (data.status === 'success') {
          mostrarToast('¡Inscripción y pago registrados exitosamente!');
          document.getElementById('cu02-form').reset();
          await cargarAforosCentrales();
        } else {
          alert(data.message || 'Error al procesar la inscripción.');
        }
      } catch (e) {
        console.error('Error al inscribir:', e);
      } finally {
        evaluarCupo();
      }
    });
  }

  // Evento Crear Nuevo Grupo
  if (btnCrearGrupo) {
    btnCrearGrupo.addEventListener('click', async () => {
      const nombreClase = document.getElementById('nuevo-nombre-clase')?.value.trim();
      const idInstructor = document.getElementById('nuevo-instructor-select')?.value;
      const cupoMaximo = document.getElementById('nuevo-cupo-maximo')?.value;
      const costoCuota = document.getElementById('nuevo-costo-cuota')?.value;

      if (!nombreClase || !cupoMaximo || !costoCuota) {
        alert('Por favor completa todos los campos del taller.');
        return;
      }

      const formData = new FormData();
      formData.append('nombre_clase', nombreClase);
      formData.append('id_instructor', idInstructor);
      formData.append('cupo_maximo', cupoMaximo);
      formData.append('costo_cuota', costoCuota);

      try {
        const res = await fetch('php/obtener_y_crear_grupos.php', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();

        if (data.status === 'success') {
          mostrarToast('Taller creado con éxito.');
          document.getElementById('form-nuevo-grupo').reset();
          await cargarAforosCentrales();
        } else {
          alert(data.message || 'No se pudo crear el taller.');
        }
      } catch (e) {
        console.error('Error al crear grupo:', e);
      }
    });
  }

  // Cargar Instructores
  async function cargarInstructoresSelect() {
    const select = document.getElementById('nuevo-instructor-select');
    if (!select) return;

    try {
      const res = await fetch('php/obtener_y_crear_grupos.php');
      const data = await res.json();
      if (data.instructores) {
        select.innerHTML = '<option value="" disabled selected>Selecciona un instructor...</option>';
        data.instructores.forEach(ins => {
          select.innerHTML += `<option value="${ins.id_instructor}">${ins.nombre_completo}</option>`;
        });
      }
    } catch (e) {
      console.error('Error al obtener instructores:', e);
    }
  }

  // Cargar Inscripciones Activas para Liberar
  async function cargarInscripcionesActivas() {
    const select = document.getElementById('select-liberar');
    if (!select) return;

    try {
      const res = await fetch('php/obtener_y_crear_grupos.php?accion=inscripciones_activas');
      const data = await res.json();
      select.innerHTML = '';

      if (data.status === 'success' && data.inscripciones.length > 0) {
        data.inscripciones.forEach(ins => {
          select.innerHTML += `<option value="${ins.id_inscripcion}">${ins.alumno} - ${ins.taller}</option>`;
        });
      } else {
        select.innerHTML = '<option value="">No hay inscripciones activas</option>';
      }
    } catch (e) {
      console.error('Error al obtener inscripciones activas:', e);
    }
  }

  // Liberar Cupo / Baja
  if (btnLiberar) {
    btnLiberar.addEventListener('click', async () => {
      const idInscripcion = document.getElementById('select-liberar')?.value;
      if (!idInscripcion) return;

      const formData = new FormData();
      formData.append('id_inscripcion', idInscripcion);

      try {
        const res = await fetch('php/inscribir_alumno.php?accion=cancelar', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.status === 'success') {
          mostrarToast('Cupo liberado exitosamente.');
          await cargarAforosCentrales();
        } else {
          alert(data.message);
        }
      } catch (e) {
        console.error('Error al liberar cupo:', e);
      }
    });
  }

  if (tallerSelect) {
    tallerSelect.addEventListener('change', evaluarCupo);
  }

  cargarAforosCentrales();
}