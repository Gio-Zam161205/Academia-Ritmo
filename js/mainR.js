
/* ==========================================================================
   ACADEMIA RITMO - LÓGICA INTEGRADA DE RECEPCIÓN Y CONTROL DE AFOROS (CU-02)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavegacionPestanas();
  initCU02();
  cargarUsuarioSesion();
});

// 1. MANEJO DE PESTAÑAS (TABS)
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

// Función global de respaldo para llamadas inline 'onclick' si existen en HTML
function abrirTab(idTab, btn) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active-tab'));
  document.querySelectorAll('.btn-tab').forEach(b => b.classList.remove('active'));
  
  const target = document.getElementById(idTab);
  if (target) target.classList.add('active-tab');
  if (btn) btn.classList.add('active');
}

// 2. RECUPERAR DATOS DE LA SESIÓN DEL USUARIO
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

// 3. MÓDULO PRINCIPAL DE RECEPCIÓN
function initCU02() {
  const tallerSelect = document.getElementById('cu02-taller-select');
  const selectLiberar = document.getElementById('select-liberar');
  const selectPendientes = document.getElementById('select-alumnos-pendientes');
  const instructorSelect = document.getElementById('nuevo-instructor-select');
  const alertSobrecupo = document.getElementById('cu02-alert-sobrecupo');
  
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
          renderizarTablaAulas(dataAforos.data);
          renderizarOpcionesSelect(dataAforos.data);
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

      // 3. Obtener Inscripciones para Liberar Cupo
      const resInsc = await fetch('php/liberar_cupo.php?accion=listar');
      if (resInsc.ok) {
        const dataInsc = await resInsc.json();
        if (dataInsc.status === 'success') {
          renderizarListaLiberar(dataInsc.data);
        }
      }

      // 4. Obtener Alumnos Pendientes de Pago
      await cargarAlumnosPendientes();

    } catch (e) {
      console.error('Error al conectar con la base de datos:', e);
    }
  }

  // B. RENDERIZAR TABLA DE AFOROS
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

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <strong class="class-name">${grupo.nombre_clase}</strong><br>
          <small class="class-sub">Prof. ${instructor} · Cupo Máx: ${max}</small>
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

  // C. RENDERIZAR SELECTORES
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
      selectLiberar.innerHTML += `<option value="${i.id_inscripcion}">ID #${i.id_inscripcion} - ${alumnoNombre} (${i.nombre_clase})</option>`;
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

      if (result.status === 'success' && result.data.length > 0) {
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
        btnInscribir.textContent = 'Completar Registro ➔';
      }
    }
  }

  if (tallerSelect) {
    tallerSelect.addEventListener('change', () => {
      evaluarCupo();
      actualizarMontoCuota();
    });
  }

  // F. EVENTO: INSCRIBIR Y COBRAR INICIAL
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
        alert('Ingresa el nombre, apellidos y selecciona un taller.');
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
        console.error(e);
        alert('Error al procesar el registro.');
        evaluarCupo();
      }
    });
  }

  // G. EVENTO: REGISTRAR PAGO POSTERIOR
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

  // H. EVENTO: CREAR NUEVO GRUPO / TALLER
  if (btnCrearGrupo) {
    btnCrearGrupo.addEventListener('click', async (e) => {
      e.preventDefault();

      const nombreInput = document.getElementById('nuevo-nombre-clase');
      const cupoInput = document.getElementById('nuevo-cupo-maximo');
      const costoInput = document.getElementById('nuevo-costo-cuota');
      const instructorSel = document.getElementById('nuevo-instructor-select');

      const nombre = nombreInput ? nombreInput.value.trim() : '';
      const cupo = cupoInput ? cupoInput.value : '';
      const costo = costoInput ? costoInput.value : '';
      const idInstructor = instructorSel && instructorSel.value ? instructorSel.value : 1;

      if (!nombre || !cupo || !costo) {
        alert('Por favor completa todos los datos del nuevo grupo.');
        return;
      }

      btnCrearGrupo.disabled = true;
      btnCrearGrupo.textContent = 'Guardando...';

      const formData = new FormData();
      formData.append('nombre_clase', nombre);
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
        btnCrearGrupo.textContent = 'Guardar Taller y Asignar Instructor';
      }
    });
  }

  // I. EVENTO: LIBERAR CUPO (BAJA DE ALUMNO)
  if (btnLiberarCupo) {
    btnLiberarCupo.addEventListener('click', async () => {
      if (!selectLiberar || !selectLiberar.value) {
        alert('Selecciona una inscripción activa para liberar.');
        return;
      }
      
      const fd = new FormData();
      fd.append('id_inscripcion', selectLiberar.value);

      try {
        btnLiberarCupo.disabled = true;
        btnLiberarCupo.textContent = 'Procesando...';

        const res = await fetch('php/liberar_cupo.php', { method: 'POST', body: fd });
        const result = await res.json();

        if (result.status === 'success') {
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

  // Carga inicial al arrancar el módulo
  cargarAforosCentrales();
}