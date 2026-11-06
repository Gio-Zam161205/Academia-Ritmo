<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

<<<<<<< HEAD
// Verificar si el usuario ha iniciado sesión
=======
// Si no hay sesión activa, responder 401 Unauthorized
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'status' => 'unauthorized',
        'message' => 'No hay sesión activa.'
    ]);
    exit();
}

$nombre_completo = $_SESSION['nombre'] ?? 'Usuario Recepción';
$rol             = $_SESSION['rol'] ?? 'RECEPCIONISTA';

<<<<<<< HEAD
// Generar iniciales dinámicas (ej: "Laura Sánchez" -> "LS")
=======
// Generar iniciales para el avatar (ej. "Laura Sánchez" -> "LS")
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
$partes = explode(' ', trim($nombre_completo));
$iniciales = strtoupper(substr($partes[0], 0, 1));
if (count($partes) > 1) {
    $iniciales .= strtoupper(substr($partes[count($partes) - 1], 0, 1));
}

echo json_encode([
    'status' => 'success',
    'nombre' => $nombre_completo,
    'rol'    => ucfirst(strtolower($rol)),
    'iniciales' => $iniciales
]);
<<<<<<< HEAD
exit();
?>
=======
exit();
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
