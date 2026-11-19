<?php
// php/obtener_usuario_sesion.php
ob_start();
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

session_start();

if (ob_get_length()) {
    ob_clean();
}

// 1. Permitir únicamente método GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Método HTTP no permitido.'
    ]);
    exit();
}

// 2. Verificar si el usuario ha iniciado sesión
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'status'  => 'unauthorized',
        'message' => 'No hay sesión activa.'
    ]);
    exit();
}

$nombre_completo = trim($_SESSION['nombre'] ?? $_SESSION['nombre_completo'] ?? 'Usuario Recepción');
$rol             = trim($_SESSION['rol'] ?? 'RECEPCIONISTA');

// 3. Generar iniciales dinámicas con soporte UTF-8 para acentos y Ñ (ej. "Laura Sánchez" -> "LS")
$partes = preg_split('/\s+/', $nombre_completo, -1, PREG_SPLIT_NO_EMPTY);
$iniciales = 'US';

if (!empty($partes)) {
    $primeraLetra = mb_strtoupper(mb_substr($partes[0], 0, 1, 'UTF-8'), 'UTF-8');
    $segundaLetra = '';
    if (count($partes) > 1) {
        $segundaLetra = mb_strtoupper(mb_substr($partes[count($partes) - 1], 0, 1, 'UTF-8'), 'UTF-8');
    }
    $iniciales = $primeraLetra . $segundaLetra;
}

// 4. Formatear etiqueta legible del rol
$rolUpper = strtoupper($rol);
$rolLegible = match ($rolUpper) {
    'ADMIN'                   => 'Administrador',
    'INSTRUCTOR', 'DOCENTE'   => 'Instructor',
    'RECEPCIONISTA'           => 'Recepcionista',
    default                   => ucfirst(strtolower($rol))
};

echo json_encode([
    'status'    => 'success',
    'nombre'    => $nombre_completo,
    'rol'       => $rolLegible,
    'rol_raw'   => $rolUpper,
    'iniciales' => $iniciales
]);
exit();