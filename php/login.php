<?php
// php/login.php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido.']);
    exit();
}

$username = trim($_POST['username'] ?? '');
$password = trim($_POST['password'] ?? '');

if (empty($username) || empty($password)) {
    echo json_encode(['status' => 'error', 'message' => 'Por favor llena todos los campos.']);
    exit();
}

try {
    // Buscar usuario por correo o nombre de usuario
    $stmt = $pdo->prepare("SELECT id_usuario, nombre_completo, correo, password_hash, rol FROM Usuario WHERE correo = :username LIMIT 1");
    $stmt->execute(['username' => $username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        // Credenciales correctas: Crear Sesión
        $_SESSION['user_id'] = $user['id_usuario'];
        $_SESSION['nombre'] = $user['nombre_completo'];
        $_SESSION['rol'] = $user['rol'];

        // Determinar redirección según el ROL
        $redirectUrl = 'index.html'; // Default para RECEPCIONISTA
        if ($user['rol'] === 'ADMIN') {
            $redirectUrl = 'admin.html';
        } elseif ($user['rol'] === 'INSTRUCTOR') {
            $redirectUrl = 'instructor.html';
        } elseif ($user['rol'] === 'RECEPCIONISTA') {
            $redirectUrl = 'index.html';
        }

        echo json_encode([
            'status' => 'success',
            'message' => '¡Inicio de sesión correcto!',
            'redirect' => $redirectUrl
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Usuario o contraseña incorrectos.']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage()]);
}
?>