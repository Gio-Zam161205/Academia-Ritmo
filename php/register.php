<?php
// php/register.php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido.']);
    exit();
}

$fullname = trim($_POST['fullname'] ?? '');
$username = trim($_POST['username'] ?? '');
$role     = trim($_POST['role'] ?? '');
$password = trim($_POST['password'] ?? '');

if (empty($fullname) || empty($username) || empty($role) || empty($password)) {
    echo json_encode(['status' => 'error', 'message' => 'Todos los campos son obligatorios.']);
    exit();
}

if (!in_array($role, ['ADMIN', 'INSTRUCTOR', 'RECEPCIONISTA'])) {
    echo json_encode(['status' => 'error', 'message' => 'Rol invalido seleccionado.']);
    exit();
}

try {
    // Verificar si el correo ya existe
    $stmtCheck = $pdo->prepare("SELECT id_usuario FROM Usuario WHERE correo = :correo");
    $stmtCheck->execute(['correo' => $username]);
    if ($stmtCheck->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'El correo institucional ya se encuentra registrado.']);
        exit();
    }

    // Encriptar contraseña y registrar
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);
    $stmtInsert = $pdo->prepare("INSERT INTO Usuario (nombre_completo, correo, password_hash, rol) VALUES (:fullname, :correo, :hash, :rol)");
    $stmtInsert->execute([
        'fullname' => $fullname,
        'correo'   => $username,
        'hash'     => $passwordHash,
        'rol'      => $role
    ]);

    echo json_encode([
        'status'  => 'success',
        'message' => 'Usuario registrado exitosamente.'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?>