/**
 * js/log.js - Manejo de Autenticación e Inicio de Sesión
 * Academia de Baile "Ritmo"
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const alertBox = document.getElementById('alertBox');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const passwordInput = document.getElementById('password');
  const usernameInput = document.getElementById('username');
  const submitBtn = document.getElementById('submitBtn');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const demoButtons = document.querySelectorAll('.btn-demo');
  const spinner = submitBtn ? submitBtn.querySelector('.spinner') : null;

  // 1. Mostrar / Ocultar Contraseña (ojo / cerrado)
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  // 2. Mostrar / Ocultar caja de alertas
  function showAlert(message, type = 'error') {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = `alert-box ${type}`;
    alertBox.style.display = 'flex';
  }

  function hideAlert() {
    if (alertBox) {
      alertBox.style.display = 'none';
    }
  }

  // 3. Olvidé mi contraseña
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      showAlert('Solicitud recibida. Contacta al administrador para restablecer tu acceso.', 'success');
    });
  }

  // 4. Botón rápido o enlace de redirección al registro
  demoButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = 'registrer.html'; // Redirige a la pantalla de registro
    });
  });

  // 5. Envío de Credenciales al Backend en PHP (php/login.php)
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const username = usernameInput ? usernameInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value.trim() : '';

      if (!username || !password) {
        showAlert('Ingresa tu usuario y contraseña.', 'error');
        return;
      }

      // Activar estado de carga
      submitBtn.disabled = true;
      if (spinner) spinner.style.display = 'inline-block';

      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      try {
        // Petición a la ruta php/login.php desde la raíz
        const response = await fetch('php/login.php', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP Error Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
          showAlert(result.message, 'success');
          
          // Redirección dinámica según el ROL retornado por php/login.php:
          // ADMIN -> admin.html | INSTRUCTOR -> instructor.html | RECEPCIONISTA -> index.html
          setTimeout(() => {
            window.location.href = result.redirect;
          }, 1000);
        } else {
          showAlert(result.message || 'Usuario o contraseña incorrectos.', 'error');
          submitBtn.disabled = false;
          if (spinner) spinner.style.display = 'none';
        }
      } catch (error) {
        showAlert('Error al conectar con el servidor backend (php/login.php).', 'error');
        submitBtn.disabled = false;
        if (spinner) spinner.style.display = 'none';
      }
    });
  }
});