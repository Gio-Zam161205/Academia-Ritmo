<?php
// php/login.php
ob_start();
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
session_start();
require_once '../config/db.php';

// Limpiar cualquier búfer previo de salida
if (ob_get_length()) {
    ob_clean();
}

// 1. Permitir únicamente peticiones POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método HTTP no permitido.']);
    exit();
}

// 2. Obtener datos enviados desde el formulario (soporta JSON o FormData)
$inputRaw = file_get_contents('php://input');
$data = json_decode($inputRaw, true);
if (!is_array($data)) {
    $data = [];
}

$correo   = trim($data['correo'] ?? $_POST['correo'] ?? $_POST['username'] ?? '');
$password = (string)($data['password'] ?? $_POST['password'] ?? '');

if ($correo === '' || trim($password) === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Por favor, ingresa el correo y la contraseña.']);
    exit();
}

// Helper para detectar el tipo de dispositivo e IP real
function obtenerDispositivoYIP(): string {
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    if (strpos($ip, ',') !== false) {
        $ip = trim(explode(',', $ip)[0]);
    }
    if ($ip === '::1') {
        $ip = '127.0.0.1';
    }

    $userAgent = strtolower($_SERVER['HTTP_USER_AGENT'] ?? '');
    $esMovil = preg_match('/(android|iphone|ipad|ipod|blackberry|windows phone|mobile)/i', $userAgent);
    $tipo = $esMovil ? 'Móvil' : 'Escritorio';

    return mb_substr("{$ip} ({$tipo})", 0, 100);
}

// Helper aislado para guardar en la bitácora sin interrumpir el flujo principal
function registrarBitacoraAcceso(PDO $pdo, string $usuario, string $correo, string $rol, string $ipDispositivo, string $estado): void {
    try {
        $stmtLog = $pdo->prepare("
            INSERT INTO log_acceso (usuario, correo, rol, fecha_hora, ip_dispositivo, estado) 
            VALUES (:usr, :correo, :rol, NOW(), :ip, :estado)
        ");
        $stmtLog->execute([
            ':usr'    => mb_substr($usuario, 0, 50),
            ':correo' => mb_substr($correo, 0, 100),
            ':rol'    => mb_substr($rol, 0, 30),
            ':ip'     => $ipDispositivo,
            ':estado' => $estado
        ]);
    } catch (PDOException $e) {
        // Silencioso para no bloquear el login si la tabla de bitácora tiene algún inconveniente
    }
}

try {
    // 3. Buscar usuario en la base de datos por correo (insensible a mayúsculas/minúsculas)
    $stmt = $pdo->prepare("
        SELECT id_usuario, nombre_completo, correo, password_hash, rol 
        FROM usuario 
        WHERE LOWER(correo) = LOWER(:correo) 
        LIMIT 1
    ");
    $stmt->execute([':correo' => $correo]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    $dispositivoInfo = obtenerDispositivoYIP();

    // 4. Si el usuario NO existe o la contraseña NO coincide
    if (!$user || !password_verify($password, $user['password_hash'])) {
        registrarBitacoraAcceso(
            $pdo,
            $user['nombre_completo'] ?? 'desconocido',
            $correo,
            $user['rol'] ?? 'DESCONOCIDO',
            $dispositivoInfo,
            'Fallido'
        );

        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Usuario o contraseña incorrectos.']);
        exit();
    }

    // 5. Inicio de sesión exitoso: Regenerar ID de sesión por seguridad y guardar datos
    session_regenerate_id(true);

    $rolNormalizado = strtoupper(trim($user['rol']));
    $_SESSION['user_id']       = intval($user['id_usuario']);
    $_SESSION['nombre']        = $user['nombre_completo'];
    $_SESSION['correo']        = $user['correo'];
    $_SESSION['rol']           = $rolNormalizado;
    $_SESSION['id_instructor'] = intval($user['id_usuario']);

    // Determinar ruta de redirección según el rol (respaldo para log.js)
    $redirectUrl = 'index.html';
    if ($rolNormalizado === 'ADMIN') {
        $redirectUrl = 'admin.html';
    } elseif ($rolNormalizado === 'INSTRUCTOR' || $rolNormalizado === 'DOCENTE') {
        $redirectUrl = 'instructor.html';
    }

    // 6. Registrar acceso EXITOSO en la tabla log_acceso de MySQL
    registrarBitacoraAcceso(
        $pdo,
        $user['nombre_completo'],
        $user['correo'],
        $rolNormalizado,
        $dispositivoInfo,
        'Exitoso'
    );

    // 7. Devolver respuesta JSON exitosa
    echo json_encode([
        'status'   => 'success',
        'message'  => '¡Inicio de sesión exitoso!',
        'rol'      => $rolNormalizado,
        'nombre'   => $user['nombre_completo'],
        'redirect' => $redirectUrl
    ]);
    exit();

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Error interno al procesar el inicio de sesión.']);
    exit();
}