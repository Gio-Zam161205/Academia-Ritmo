/* ==========================================================================
   ACADEMIA RITMO - LÓGICA PANEL ADMINISTRATIVO
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const kpiAlumnosElem = document.getElementById('kpiAlumnos');
  const kpiMontoElem = document.getElementById('kpiMonto');
  const logsTableBody = document.getElementById('logsTableBody');
  const btnRefreshLogs = document.getElementById('btnRefreshLogs');

  let isLoading = false;

  // Cargar métricas y bitácora desde el backend PHP
  async function cargarDashboardAdmin() {
    if (isLoading) return;
    isLoading = true;

    try {
      const response = await fetch('php/obtener_datos_admin.php');

      if (response.status === 401) {
        window.location.href = 'log.html';
        return;
      }

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status} al obtener datos del panel.`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        // 1. Actualizar KPIs Principales
        if (kpiAlumnosElem && data.kpis) {
          kpiAlumnosElem.textContent = data.kpis.total_alumnos ?? '0';
        }
        if (kpiMontoElem && data.kpis) {
          kpiMontoElem.textContent = data.kpis.monto_recaudado ?? '$0.00';
        }

        // 2. Poblar la tabla de logs de accesos
        if (logsTableBody) {
          const logs = Array.isArray(data.logs) ? data.logs : [];
          logsTableBody.innerHTML = '';

          if (logs.length === 0) {
            logsTableBody.innerHTML =
              '<tr><td colspan="5" style="text-align:center; padding:20px; color:#94a3b8;">No hay registros de acceso recientes.</td></tr>';
            return;
          }

          logs.forEach((log) => {
            const tr = document.createElement('tr');

            // Formatear Badge de Rol (Docente, Recepción, Administrador)
            const rolStr = (log.rol || 'USUARIO').toUpperCase();
            let roleClass = 'docente';
            let roleText = 'Docente';

            if (rolStr.includes('ADMIN')) {
              roleClass = 'admin';
              roleText = 'Administrador';
            } else if (rolStr.includes('RECEPCION') || rolStr.includes('RECEPCIÓN')) {
              roleClass = 'recepcion';
              roleText = 'Recepción';
            }

            // Formatear Badge de Estado (Exitoso / Fallido)
            const isSuccess = (log.estado || 'Exitoso').toLowerCase() === 'exitoso';
            const statusClass = isSuccess ? 'success' : 'error';
            const statusText = isSuccess ? 'Exitoso' : 'Fallido';

            tr.innerHTML = `
              <td>
                <div class="user-cell">
                  <strong>${escapeHtml(log.usuario || 'Desconocido')}</strong>
                  <span>${escapeHtml(log.correo || 'Sin correo')}</span>
                </div>
              </td>
              <td><span class="role-badge ${roleClass}">${roleText}</span></td>
              <td>${escapeHtml(log.fecha_formateada || '--')}</td>
              <td>${escapeHtml(log.ip_dispositivo || 'No registrada')}</td>
              <td><span class="status-pill ${statusClass}">${statusText}</span></td>
            `;

            logsTableBody.appendChild(tr);
          });
        }
      } else {
        throw new Error(data.message || 'Respuesta inválida del servidor.');
      }
    } catch (error) {
      console.error('Error al cargar datos del panel admin:', error);
      if (logsTableBody) {
        logsTableBody.innerHTML =
          '<tr><td colspan="5" style="text-align:center; padding:20px; color:#ef4444;">Error al cargar la bitácora. Verifica la conexión con el servidor.</td></tr>';
      }
    } finally {
      isLoading = false;
    }
  }

  // Evento para el botón Actualizar
  if (btnRefreshLogs) {
    btnRefreshLogs.addEventListener('click', async () => {
      if (isLoading) return;

      btnRefreshLogs.textContent = '⏳ Cargando...';
      btnRefreshLogs.disabled = true;

      await cargarDashboardAdmin();

      setTimeout(() => {
        btnRefreshLogs.textContent = '🔄 Actualizar';
        btnRefreshLogs.disabled = false;
      }, 400);
    });
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Cargar datos al iniciar
  cargarDashboardAdmin();
});