<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php'; // Conexión PDO centralizada[cite: 4, 8]

try {
    // Consulta SQL normalizada en 3FN que calcula el aforo consumido dinámicamente
    $query = "SELECT 
                g.id_grupo,
                g.nombre_clase,
                g.cupo_maximo,
                COUNT(i.id_inscripcion) AS ocupacion_actual,
                (g.cupo_maximo - COUNT(i.id_inscripcion)) AS cupo_disponible
              FROM Grupo_Taller g
              LEFT JOIN Inscripcion i 
                ON g.id_grupo = i.id_grupo AND i.estado_inscripcion = 'ACTIVA'
              GROUP BY g.id_grupo, g.nombre_clase, g.cupo_maximo";

    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $grupos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'data' => $grupos]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}