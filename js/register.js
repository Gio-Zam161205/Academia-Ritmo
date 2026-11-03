/**
 * js/register.js - Lógica de Registro de Usuarios
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

  // 2. Funciones de alerta
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

  // 3. Envío del formulario a php/register.php
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const fullnameInput = document.getElementById('fullname');
      const usernameInput = document.getElementById('username');
      const roleSelect = document.getElementById('role');

      const fullname = fullnameInput ? fullnameInput.value.trim() : '';
      const username = usernameInput ? usernameInput.value.trim() : '';
      const role = roleSelect ? roleSelect.value : '';
      const password = passwordInput ? passwordInput.value : '';
      const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

      // Validaciones en el cliente
      if (!fullname || !username || !role || !password || !confirmPassword) {
        showAlert('Por favor, completa todos los campos del formulario.', 'error');
        return;
      }

     // Validación en js/register.js
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

      // Empaquetado de datos
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

        if (!response.ok) {
          throw new Error(`HTTP Error Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
          showAlert(result.message, 'success');
          setTimeout(() => {
            window.location.href = 'log.html'; // Redirige al login tras registro exitoso
          }, 1500);
        } else {
          showAlert(result.message || 'Error al registrar el usuario.', 'error');
          submitBtn.disabled = false;
          if (spinner) spinner.style.display = 'none';
        }
      } catch (error) {
        showAlert('Error de conexión con el servidor backend (php/register.php).', 'error');
        submitBtn.disabled = false;
        if (spinner) spinner.style.display = 'none';
      }
    });
  }
});