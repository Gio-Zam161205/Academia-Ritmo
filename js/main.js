/* ==========================================================================
   ACADEMIA RITMO - LÓGICA DE INTERACCIÓN INTEGRAL (CU-01 & CU-02)
   Materia: Ingeniería de Software
   Archivo: JS/main.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCU01();
  initCU02();
});

/* --------------------------------------------------------------------------
   CU-01: REGISTRAR ASISTENCIA Y VALIDAR PAGO (DOCENTE MÓVIL)
   -------------------------------------------------------------------------- */
function initCU01() {
  const switchBtns = document.querySelectorAll('.cu01-switch');
  const syncBtn = document.getElementById('cu01-sync-btn');
  const modal = document.getElementById('cu01-modal');
  const modalClose = document.getElementById('cu01-modal-close');
  const counterTag = document.getElementById('cu01-counter');
  const groupSelect = document.getElementById('cu01-group-select');

  if (!switchBtns.length) return;

  // Parámetros de congruencia con la BD (Salsa Intermedio tiene 18 alumnos inscritos)
  const TOTAL_INSCRITOS = 18;
  // Representa los 15 alumnos restantes del grupo que ya tienen su registro base
  const BASE_PRESENTES = 15;

  // Actualiza el indicador respetando la nómina global de 18 alumnos
  function updateCounter() {
    const visiblesActivos = document.querySelectorAll('.cu01-switch.active').length;
    const totalPresentes = BASE_PRESENTES + visiblesActivos;
    
    if (counterTag) {
      counterTag.textContent = `${totalPresentes} / ${TOTAL_INSCRITOS} Presentes`;
    }
  }

  // Interacción táctil en los conmutadores de presencia
  switchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.student-card');
      const isPresent = btn.classList.toggle('active');

      if (isPresent) {
        btn.innerHTML = `<span class="icon">✓</span> Presente`;
        card.classList.add('marked');
      } else {
        btn.innerHTML = `<span class="icon">✕</span> Falta`;
        card.classList.remove('marked');
      }
      updateCounter();
    });
  });

  // Apertura de modal al sincronizar
  if (syncBtn && modal) {
    syncBtn.addEventListener('click', () => {
      modal.classList.add('active');
    });
  }

  // Cierre de modal
  if (modalClose && modal) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  // Cambio de grupo en el selector
  if (groupSelect) {
    groupSelect.addEventListener('change', () => {
      alert(`Consultando base de datos: Cargando nómina del grupo "${groupSelect.options[groupSelect.selectedIndex].text}"...`);
    });
  }
}

/* --------------------------------------------------------------------------
   CU-02: CONTROL DE AFORO E INSCRIPCIONES (RECEPCIÓN ESCRITORIO)
   -------------------------------------------------------------------------- */
function initCU02() {
  const tallerSelect = document.getElementById('cu02-taller-select');
  const btnInscribir = document.getElementById('cu02-btn-inscribir');
  const alertSobrecupo = document.getElementById('cu02-alert-sobrecupo');
  const toastSuccess = document.getElementById('cu02-toast');

  if (!tallerSelect || !btnInscribir) return;

  // Manejo de disponibilidad y regla de sobrecupo (RF-05)
  tallerSelect.addEventListener('change', () => {
    const selectedOption = tallerSelect.options[tallerSelect.selectedIndex];
    const cupo = parseInt(selectedOption.getAttribute('data-cupo'), 10);

    if (cupo <= 0) {
      // Bloqueo estricto por sobrecupo (0 lugares libres)
      if (alertSobrecupo) alertSobrecupo.classList.add('visible');
      btnInscribir.disabled = true;
      btnInscribir.classList.add('disabled');
      btnInscribir.textContent = 'Inscripción Inhabilitada (Sobrecupo)';
    } else {
      // Taller con lugares disponibles
      if (alertSobrecupo) alertSobrecupo.classList.remove('visible');
      btnInscribir.disabled = false;
      btnInscribir.classList.remove('disabled');
      btnInscribir.textContent = 'Confirmar Inscripción';
    }
  });

  // Confirmación de inscripción
  btnInscribir.addEventListener('click', (e) => {
    e.preventDefault();
    if (btnInscribir.disabled) return;

    if (toastSuccess) {
      toastSuccess.classList.add('show');
      setTimeout(() => {
        toastSuccess.classList.remove('show');
      }, 3500);
    }
  });
}