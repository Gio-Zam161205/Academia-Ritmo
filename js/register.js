/**
 * register.js - Lógica de Registro de Usuarios
 * Academia de Baile "Ritmo"
 */

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const alertBox = document.getElementById('alertBox');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const submitBtn = document.getElementById('submitBtn');
  const spinner = submitBtn ? submitBtn.querySelector('.spinner') : null;

  // 1. Alternar visibilidad de contraseñas
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      if (confirmPasswordInput) {
        confirmPasswordInput.type = isPassword ? 'text' : 'password';
      }
      togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  // 2. Funciones auxiliares para mostrar/ocultar alertas
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

  // 3. Envío del formulario al servidor backend en PHP
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const fullname = document.getElementById('fullname').value.trim();
      const username = document.getElementById('username').value.trim();
      const role = document.getElementById('role').value;
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

      // Validaciones del Frontend
      if (!fullname || !username || !role || !password || !confirmPassword) {
        showAlert('Por favor, completa todos los campos del formulario.', 'error');
        return;
      }

      if (role !== 'INSTRUCTOR' && role !== 'RECEPCIONISTA' && role !== 'ADMIN') {
        showAlert('Por favor, selecciona un rol válido.', 'error');
        return;
      }

      if (password.length < 8) {
        showAlert('La contraseña debe tener al menos 8 caracteres.', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showAlert('Las contraseñas no coinciden.', 'error');
        return;
      }

      // Estado de carga
      submitBtn.disabled = true;
      if (spinner) spinner.style.display = 'inline-block';

      // Empaquetado de datos para el backend
      const formData = new FormData();
      formData.append('fullname', fullname);
      formData.append('username', username);
      formData.append('role', role);
      formData.append('password', password);

      try {
        const response = await fetch('php/register.php', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.status === 'success') {
          showAlert(result.message, 'success');
          setTimeout(() => {
            window.location.href = 'log.html';
          }, 1500);
        } else {
          showAlert(result.message || 'Error al registrar el usuario.', 'error');
          submitBtn.disabled = false;
          if (spinner) spinner.style.display = 'none';
        }
      } catch (error) {
        showAlert('Error de conexión con el servidor backend.', 'error');
        submitBtn.disabled = false;
        if (spinner) spinner.style.display = 'none';
      }
    });
  }
});