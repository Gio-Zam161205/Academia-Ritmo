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
  const alumnoSelect = document.getElementById('cu02-alumno-select');
  const selectLiberar = document.getElementById('select-liberar');
  const alertSobrecupo = document.getElementById('cu02-alert-sobrecupo');
  const btnInscribir = document.getElementById('cu02-btn-inscribir');
  const btnCrearGrupo = document.getElementById('btn-crear-grupo');
  const btnLiberarCupo = document.getElementById('btn-liberar-cupo');
  const toast = document.getElementById('cu02-toast');

  async function cargarTodo() {
    try {
      const resAforos = await fetch('php/obtener_aforos.php');
      const dataAforos = await resAforos.json();
      
      const resGrupos = await fetch('php/obtener_y_crear_grupos.php');
      const dataGrupos = await resGrupos.json();

      const resInsc = await fetch('php/liberar_cupo.php?accion=listar');
      const dataInsc = await resInsc.json();

      if (dataAforos.status === 'success') {
        renderizarTablaAulas(dataAforos.data);
        renderizarOpcionesSelect(dataAforos.data);
      }
      if (dataGrupos.status === 'success') {
        renderizarAlumnosSelect(dataGrupos.alumnos);
      }
      if (dataInsc.status === 'success') {
        renderizarListaLiberar(dataInsc.data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function renderizarTablaAulas(grupos) {
    const tbody = document.querySelector('.desk-table tbody');
    tbody.innerHTML = grupos.length ? '' : '<tr><td colspan="5" style="text-align:center;">Sin talleres</td></tr>';
    
    grupos.forEach((grupo) => {
      const ocu = parseInt(grupo.ocupacion_actual || 0);
      const max = parseInt(grupo.cupo_maximo || 1);
      const lib = parseInt(grupo.cupo_disponible || 0);
      const pct = Math.min(Math.round((ocu / max) * 100), 100);
      const lleno = lib <= 0;

      tbody.innerHTML += `
        <tr>
          <td><strong class="class-name">${grupo.nombre_clase}</strong><br><small class="class-sub">Cupo Máx: ${max}</small></td>
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

  function renderizarAlumnosSelect(alumnos) {
    alumnoSelect.innerHTML = '';
    alumnos.forEach(a => {
      alumnoSelect.innerHTML += `<option value="${a.id_alumno}">${a.nombre} ${a.apellidos}</option>`;
    });
  }

  function renderizarOpcionesSelect(grupos) {
    tallerSelect.innerHTML = '';
    grupos.forEach(g => {
      const lib = parseInt(g.cupo_disponible || 0);
      tallerSelect.innerHTML += `<option value="${g.id_grupo}" data-cupo="${lib}">${g.nombre_clase} (${lib} cupos ${lib<=0?'- AGOTADO':''})</option>`;
    });
    evaluarCupo();
  }

  function renderizarListaLiberar(inscripciones) {
    selectLiberar.innerHTML = inscripciones.length ? '' : '<option disabled selected>No hay inscripciones activas</option>';
    inscripciones.forEach(i => {
      selectLiberar.innerHTML += `<option value="${i.id_inscripcion}">${i.alumno} - ${i.nombre_clase}</option>`;
    });
  }

  function evaluarCupo() {
    if (!tallerSelect.options.length) return;
    const opt = tallerSelect.options[tallerSelect.selectedIndex];
    const cupo = parseInt(opt.dataset.cupo || '0');

    if (cupo <= 0) {
      alertSobrecupo.classList.add('visible');
      btnInscribir.disabled = true;
      btnInscribir.classList.add('disabled');
      btnInscribir.textContent = 'Inscripción Inhabilitada';
    } else {
      alertSobrecupo.classList.remove('visible');
      btnInscribir.disabled = false;
      btnInscribir.classList.remove('disabled');
      btnInscribir.textContent = 'Confirmar e Inscribir';
    }
  }

  tallerSelect.addEventListener('change', evaluarCupo);

  btnInscribir.addEventListener('click', async () => {
    if (btnInscribir.disabled) return;
    const fd = new FormData();
    fd.append('id_alumno', alumnoSelect.value);
    fd.append('id_grupo', tallerSelect.value);

    const res = await fetch('php/inscribir_alumno.php', { method: 'POST', body: fd });
    const result = await res.json();
    mostrarToast(result.message);
    cargarTodo();
  });

  if (btnCrearGrupo) {
    btnCrearGrupo.addEventListener('click', async () => {
      const fd = new FormData();
      fd.append('nombre_clase', document.getElementById('nuevo-nombre-clase').value);
      fd.append('cupo_maximo', document.getElementById('nuevo-cupo-maximo').value);
      fd.append('costo_cuota', document.getElementById('nuevo-costo-cuota').value);
      
      const res = await fetch('php/obtener_y_crear_grupos.php', { method: 'POST', body: fd });
      const result = await res.json();
      mostrarToast(result.message);
      document.getElementById('form-nuevo-grupo').reset();
      cargarTodo();
    });
  }

  if (btnLiberarCupo) {
    btnLiberarCupo.addEventListener('click', async () => {
      if(!selectLiberar.value) return;
      const fd = new FormData();
      fd.append('id_inscripcion', selectLiberar.value);
      
      const res = await fetch('php/liberar_cupo.php', { method: 'POST', body: fd });
      const result = await res.json();
      mostrarToast(result.message);
      cargarTodo();
    });
  }

  function mostrarToast(msg) {
    toast.textContent = msg;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 3000);
  }

  cargarTodo();
}