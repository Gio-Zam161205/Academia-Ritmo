/**
 * log.js - Manejo de Autenticación e Inicio de Sesión
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

  // 1. Mostrar / Ocultar Contraseña
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  // 2. Funciones auxiliares para mostrar / ocultar alertas
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

  // 4. Botón rápido o de redirección
  demoButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = 'register.html';
    });
  });

  // 5. Envío de Credenciales al Backend (PHP / MySQL)
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
        const response = await fetch('php/login.php', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.status === 'success') {
          showAlert(result.message, 'success');
          
          // Redirección dinámica basada en la respuesta del rol enviada por php/login.php
          setTimeout(() => {
            window.location.href = result.redirect;
          }, 1000);
        } else {
          showAlert(result.message || 'Usuario o contraseña incorrectos.', 'error');
          submitBtn.disabled = false;
          if (spinner) spinner.style.display = 'none';
        }
      } catch (error) {
        showAlert('Error al conectar con el servidor backend.', 'error');
        submitBtn.disabled = false;
        if (spinner) spinner.style.display = 'none';
      }
    });
  }
});