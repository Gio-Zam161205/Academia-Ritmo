<?php
// php/login.php
ob_start();
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
session_start();
require_once '../config/db.php';

// Limpiar cualquier búfer previo de salida
ob_clean();

// Obtener datos enviados desde el formulario (soporta JSON o FormData)
$inputRaw = file_get_contents('php://input');
$data = json_decode($inputRaw, true);

$correo   = trim($data['correo'] ?? $_POST['correo'] ?? $_POST['username'] ?? '');
$password = trim($data['password'] ?? $_POST['password'] ?? '');

if (empty($correo) || empty($password)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Por favor, ingresa el correo y la contraseña.']);
    exit();
}

// Helper para detectar el tipo de dispositivo e IP
function obtenerDispositivoYIP() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    if ($ip === '::1') {
        $ip = '127.0.0.1';
    }
    
    $userAgent = strtolower($_SERVER['HTTP_USER_AGENT'] ?? '');
    $esMovil = preg_match('/(android|iphone|ipad|mobile)/i', $userAgent);
    $tipo = $esMovil ? 'Móvil' : 'Escritorio';

    return "{$ip} ({$tipo})";
}

try {
    // 1. Buscar usuario en la base de datos
    $stmt = $pdo->prepare("SELECT id_usuario, nombre_completo, correo, password_hash, rol FROM usuario WHERE correo = :correo LIMIT 1");
    $stmt->execute([':correo' => $correo]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    $dispositivoInfo = obtenerDispositivoYIP();

    // 2. Si el usuario NO existe o la contraseña NO coincide
    if (!$user || !password_verify($password, $user['password_hash'])) {
        
        // Registrar intento fallido en la bitácora log_acceso (si se conoce el correo)
        $stmtLog = $pdo->prepare("
            INSERT INTO log_acceso (usuario, correo, rol, fecha_hora, ip_dispositivo, estado) 
            VALUES (:usr, :correo, :rol, NOW(), :ip, 'Fallido')
        ");
        $stmtLog->execute([
            ':usr'    => $user['nombre_completo'] ?? 'desconocido',
            ':correo' => $correo,
            ':rol'    => $user['rol'] ?? 'DESCONOCIDO',
            ':ip'     => $dispositivoInfo
        ]);

        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Usuario o contraseña incorrectos.']);
        exit();
    }

    // 3. Inicio de sesión exitoso: Almacenar variables en $_SESSION
    $_SESSION['user_id']      = $user['id_usuario'];
    $_SESSION['nombre']       = $user['nombre_completo'];
    $_SESSION['rol']          = $user['rol'];
    $_SESSION['id_instructor']= $user['id_usuario'];

    // 4. Registrar acceso EXITOSO en la tabla log_acceso de MySQL
    $stmtLog = $pdo->prepare("
        INSERT INTO log_acceso (usuario, correo, rol, fecha_hora, ip_dispositivo, estado) 
        VALUES (:usr, :correo, :rol, NOW(), :ip, 'Exitoso')
    ");
    $stmtLog->execute([
        ':usr'    => $user['nombre_completo'],
        ':correo' => $user['correo'],
        ':rol'    => $user['rol'],
        ':ip'     => $dispositivoInfo
    ]);

    // 5. Devolver respuesta JSON exitosa con el rol para el ruteo dinámico
    echo json_encode([
        'status'  => 'success',
        'message' => '¡Inicio de sesión exitoso!',
        'rol'     => $user['rol'],
        'nombre'  => $user['nombre_completo']
    ]);
    exit();

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage()]);
    exit();
}
?> 