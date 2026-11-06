<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php'; // Conexión PDO centralizada[cite: 4]

try {
    // Consulta la lista de alumnos con inscripciones activas cuyo monto total pagado en Pago 
    // sea MENOR al costo del taller asignado en Grupo_Taller (Adeudo pendiente > 0)
    $query = "SELECT 
                a.id_alumno,
                CONCAT(a.nombre, ' ', a.apellidos) AS alumno_nombre,
                g.id_grupo,
                g.nombre_clase,
                g.costo_cuota,
                IFNULL(SUM(p.monto), 0) AS monto_pagado,
                (g.costo_cuota - IFNULL(SUM(p.monto), 0)) AS adeudo_pendiente
              FROM Alumno a
              INNER JOIN Inscripcion i ON a.id_alumno = i.id_alumno AND i.estado_inscripcion = 'ACTIVA'
              INNER JOIN Grupo_Taller g ON i.id_grupo = g.id_grupo
              LEFT JOIN Pago p ON a.id_alumno = p.id_alumno AND g.id_grupo = p.id_grupo
              GROUP BY a.id_alumno, a.nombre, a.apellidos, g.id_grupo, g.nombre_clase, g.costo_cuota
              HAVING adeudo_pendiente > 0";

    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $pendientes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'data' => $pendientes]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Error al obtener pendientes: ' . $e->getMessage()]);
}
exit();
?>