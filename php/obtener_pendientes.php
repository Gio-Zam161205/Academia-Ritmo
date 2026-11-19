<?php
// php/obtener_pendientes.php
ob_start();
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
session_start();
require_once '../config/db.php'; // Conexión PDO centralizada

if (ob_get_length()) {
    ob_clean();
}

// 1. Verificar sesión activa
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Sesión no iniciada o expirada.']);
    exit();
}

// 2. Permitir únicamente método GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método HTTP no permitido.']);
    exit();
}

try {
    // 3. Consulta alumnos con inscripción activa cuyo monto acumulado en pago sea menor al costo del taller
    $query = "SELECT 
                a.id_alumno,
                CONCAT(a.nombre, ' ', a.apellidos) AS alumno_nombre,
                g.id_grupo,
                g.nombre_clase,
                g.costo_cuota,
                IFNULL(SUM(p.monto), 0) AS monto_pagado,
                (g.costo_cuota - IFNULL(SUM(p.monto), 0)) AS adeudo_pendiente
              FROM alumno a
              INNER JOIN inscripcion i ON a.id_alumno = i.id_alumno AND UPPER(i.estado_inscripcion) = 'ACTIVA'
              INNER JOIN grupo_taller g ON i.id_grupo = g.id_grupo
              LEFT JOIN pago p ON a.id_alumno = p.id_alumno AND g.id_grupo = p.id_grupo
              GROUP BY a.id_alumno, a.nombre, a.apellidos, g.id_grupo, g.nombre_clase, g.costo_cuota
              HAVING adeudo_pendiente > 0
              ORDER BY alumno_nombre ASC, g.nombre_clase ASC";

    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $pendientes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'data'   => $pendientes
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Error interno al consultar los adeudos pendientes.'
    ]);
}
exit();