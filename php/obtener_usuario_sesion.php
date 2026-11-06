<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

// Verificar si el usuario ha iniciado sesión
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

// Generar iniciales dinámicas (ej: "Laura Sánchez" -> "LS")
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
exit();
?>