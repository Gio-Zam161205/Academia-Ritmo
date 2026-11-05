/* ==========================================================================
   ACADEMIA RITMO - LÓGICA DE RECEPCIÓN Y CONTROL DE AFOROS (CU-02)
   ========================================================================== */

function abrirTab(idTab, btn) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active-tab'));
  document.querySelectorAll('.btn-tab').forEach(b => b.classList.remove('active'));
  document.getElementById(idTab).classList.add('active-tab');
  btn.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  initCU02();
});

function initCU02() {
  const tallerSelect = document.getElementById('cu02-taller-select');
  const selectLiberar = document.getElementById('select-liberar');
  const instructorSelect = document.getElementById('nuevo-instructor-select');
  const alertSobrecupo = document.getElementById('cu02-alert-sobrecupo');
  const btnInscribir = document.getElementById('cu02-btn-inscribir');
  const btnCrearGrupo = document.getElementById('btn-crear-grupo');
  const btnLiberarCupo = document.getElementById('btn-liberar-cupo');
  const toast = document.getElementById('cu02-toast');

  // 1. CARGA INICIAL DE DATOS
  async function cargarAforosCentrales() {
    try {
      const resGrupos = await fetch('php/obtener_y_crear_grupos.php');
      const dataGrupos = await resGrupos.json();

      const resInsc = await fetch('php/liberar_cupo.php?accion=listar');
      const dataInsc = await resInsc.json();

      if (dataGrupos.status === 'success') {
        renderizarTablaAulas(dataGrupos.data);
        renderizarOpcionesSelect(dataGrupos.data);
        if (dataGrupos.instructores) {
          renderizarInstructoresSelect(dataGrupos.instructores);
        }
      }
      if (dataInsc.status === 'success') {
        renderizarListaLiberar(dataInsc.data);
      }
    } catch (e) {
      console.error('Error al conectar con la base de datos:', e);
    }
  }

  // 2. RENDERIZAR TABLA DE AFOROS EN VIVO
  function renderizarTablaAulas(grupos) {
    const tbody = document.querySelector('.desk-table tbody');
    if (!tbody) return;
    tbody.innerHTML = grupos.length ? '' : '<tr><td colspan="5" style="text-align:center;">No hay talleres registrados.</td></tr>';

    grupos.forEach((grupo) => {
      const ocu = parseInt(grupo.ocupacion_actual || 0);
      const max = parseInt(grupo.cupo_maximo || 1);
      const lib = parseInt(grupo.cupo_disponible || 0);
      const pct = Math.min(Math.round((ocu / max) * 100), 100);
      const lleno = lib <= 0;
      const instructor = grupo.nombre_instructor || 'Sin Asignar';

      tbody.innerHTML += `
        <tr>
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
        </tr>`;
    });
  }

  // 3. RENDERIZAR SELECTORES
  function renderizarInstructoresSelect(instructores) {
    if (!instructorSelect) return;
    instructorSelect.innerHTML = '';

    if (!instructores || instructores.length === 0) {
      instructorSelect.innerHTML = '<option value="">No hay instructores registrados</option>';
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
      tallerSelect.innerHTML += `<option value="${g.id_grupo}" data-cupo="${lib}" data-costo="${costo}">${g.nombre_clase} (${lib} cupos libres) - $${costo}</option>`;
    });
    evaluarCupo();
    actualizarMontoCuota();
  }

  function renderizarListaLiberar(inscripciones) {
    if (!selectLiberar) return;
    selectLiberar.innerHTML = inscripciones.length ? '' : '<option disabled selected>No hay inscripciones activas</option>';
    inscripciones.forEach(i => {
      selectLiberar.innerHTML += `<option value="${i.id_inscripcion}">${i.alumno} - ${i.nombre_clase}</option>`;
    });
  }

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
        btnInscribir.textContent = 'Completar Registro y Pago ➔';
      }
    }
  }

  if (tallerSelect) {
    tallerSelect.addEventListener('change', () => {
      evaluarCupo();
      actualizarMontoCuota();
    });
  }

  // 4. GUARDAR INSCRIPCIÓN
  if (btnInscribir) {
    btnInscribir.addEventListener('click', async () => {
      if (btnInscribir.disabled) return;

      const nombre = document.getElementById('alumno-nombre').value.trim();
      const apellidos = document.getElementById('alumno-apellidos').value.trim();
      const telefono = document.getElementById('alumno-telefono').value.trim();
      const idGrupo = tallerSelect.value;
      const registrarPago = document.getElementById('pago-confirmado').checked ? '1' : '0';

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
          document.getElementById('alumno-telefono').value = '';
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

  // 5. GUARDAR NUEVO GRUPO / TALLER (UNIFICADO - ÚNICO LISTENER)
  if (btnCrearGrupo) {
    btnCrearGrupo.addEventListener('click', async (e) => {
      e.preventDefault();

      const nombreInput = document.getElementById('nuevo-nombre-clase');
      const cupoInput = document.getElementById('nuevo-cupo-maximo');
      const costoInput = document.getElementById('nuevo-costo-cuota');
      const instructorSel = document.getElementById('nuevo-instructor-select') || document.getElementById('cu02-instructor-select');

      const nombre = nombreInput ? nombreInput.value.trim() : '';
      const cupo = cupoInput ? cupoInput.value : '';
      const costo = costoInput ? costoInput.value : '';
      const idInstructor = instructorSel && instructorSel.value ? instructorSel.value : 1;

      if (!nombre || !cupo || !costo) {
        alert('Por favor completa todos los datos del nuevo grupo.');
        return;
      }

      // 🔒 Bloqueo de botón contra doble clic
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
        // 🔓 Restaurar botón
        btnCrearGrupo.disabled = false;
        btnCrearGrupo.textContent = 'Guardar Grupo / Taller';
      }
    });
  }

  // 6. LIBERAR CUPO
  if (btnLiberarCupo) {
    btnLiberarCupo.addEventListener('click', async () => {
      if (!selectLiberar || !selectLiberar.value) return;
      const fd = new FormData();
      fd.append('id_inscripcion', selectLiberar.value);

      const res = await fetch('php/liberar_cupo.php', { method: 'POST', body: fd });
      const result = await res.json();
      mostrarToast(result.message);
      cargarAforosCentrales();
    });
  }

  function mostrarToast(msg) {
    if (!toast) return;
    toast.textContent = '✓ ' + msg;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 3500);
  }

  cargarAforosCentrales();
}