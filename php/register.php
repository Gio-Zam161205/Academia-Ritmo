<?php
// php/register.php
ob_start();
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php'; // Conexión PDO centralizada

if (ob_get_length()) {
    ob_clean();
}

// 1. Permitir únicamente método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método HTTP no permitido.']);
    exit();
}

// 2. Lectura flexible: acepta tanto nombres en español como en inglés
$nombre_completo = trim($_POST['nombre_completo'] ?? $_POST['fullname'] ?? '');
$correoRaw       = trim($_POST['correo'] ?? $_POST['username'] ?? '');
$password        = (string)($_POST['password'] ?? '');
$rol             = strtoupper(trim($_POST['rol'] ?? $_POST['role'] ?? ''));

// 3. Validar campos requeridos
if ($nombre_completo === '' || $correoRaw === '' || trim($password) === '' || $rol === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Por favor completa todos los campos del formulario.']);
    exit();
}

// 4. Validar nombre completo (solo letras, espacios y acentos; bloquea etiquetas HTML / XSS)
$nombre_completo = preg_replace('/\s+/', ' ', $nombre_completo);
if (!preg_match('/^[a-zA-ZÁÉÍÓÚÜáéíóúüÑñ\s\.\'-]{3,100}$/u', $nombre_completo)) {
    http_response_code(400);
    echo json_encode([
        'status'  => 'error',
        'message' => 'El nombre completo solo debe contener letras y espacios (3 a 100 caracteres).'
    ]);
    exit();
}

// 5. Validar correo electrónico estricto (bloquea inyecciones en campo correo)
$correo = filter_var($correoRaw, FILTER_SANITIZE_EMAIL);
if ($correo !== $correoRaw || !filter_var($correo, FILTER_VALIDATE_EMAIL) || mb_strlen($correo) > 100) {
    http_response_code(400);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Ingresa un correo electrónico institucional válido.'
    ]);
    exit();
}

// 6. Validar rol contra lista blanca
$rolesPermitidos = ['INSTRUCTOR', 'RECEPCIONISTA', 'ADMIN'];
if (!in_array($rol, $rolesPermitidos, true)) {
    http_response_code(400);
    echo json_encode([
        'status'  => 'error',
        'message' => 'El rol seleccionado no es válido.'
    ]);
    exit();
}

// 7. Validar longitud mínima de contraseña
if (mb_strlen($password) < 8 || mb_strlen($password) > 72) {
    http_response_code(400);
    echo json_encode([
        'status'  => 'error',
        'message' => 'La contraseña debe tener entre 8 y 72 caracteres.'
    ]);
    exit();
}

try {
    $pdo->beginTransaction();

    // 8. Verificar si el correo ya está registrado (insensible a mayúsculas/minúsculas)
    $stmtCheck = $pdo->prepare("SELECT id_usuario FROM usuario WHERE LOWER(correo) = LOWER(?) LIMIT 1");
    $stmtCheck->execute([$correo]);
    if ($stmtCheck->fetch()) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'El correo electrónico ya se encuentra registrado.']);
        exit();
    }

    // 9. Insertar en la tabla usuario con hash Bcrypt
    $password_hash = password_hash($password, PASSWORD_BCRYPT);
    $stmtUser = $pdo->prepare("INSERT INTO usuario (nombre_completo, correo, password_hash, rol) VALUES (?, ?, ?, ?)");
    $stmtUser->execute([$nombre_completo, strtolower($correo), $password_hash, $rol]);

    // 10. Si el rol es INSTRUCTOR, crear automáticamente su perfil en la tabla instructor
    if ($rol === 'INSTRUCTOR') {
        $partes = preg_split('/\s+/', $nombre_completo, -1, PREG_SPLIT_NO_EMPTY);
        $nombre = array_shift($partes);
        $apellidos = !empty($partes) ? implode(' ', $partes) : 'General';

        $stmtInst = $pdo->prepare("INSERT INTO instructor (nombre, apellidos, especialidad) VALUES (?, ?, 'Baile General')");
        $stmtInst->execute([
            mb_substr($nombre, 0, 50),
            mb_substr($apellidos, 0, 50)
        ]);
    }

    $pdo->commit();

    echo json_encode([
        'status'  => 'success',
        'message' => "¡Usuario registrado exitosamente como {$rol}! Ya puedes iniciar sesión."
    ]);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Error interno al registrar el usuario en la base de datos.'
    ]);
}
exit();