<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
require_once '../config/db.php'; // Conexión PDO centralizada

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
    $sql = "SELECT 
                g.id_grupo, 
                g.nombre_clase, 
                g.tipo_clase, 
                COALESCE(NULLIF(TRIM(g.salon), ''), 'Sala A') AS salon,
                COALESCE(NULLIF(TRIM(g.horario), ''), '18:00 - 19:30') AS horario,
                g.cupo_maximo, 
                g.costo_cuota,
                COALESCE(
                    NULLIF(TRIM(CONCAT(IFNULL(i.nombre, ''), ' ', IFNULL(i.apellidos, ''))), ''),
                    'Sin Asignar'
                ) AS nombre_instructor,
                COUNT(ins.id_inscripcion) AS ocupacion_actual,
                GREATEST(g.cupo_maximo - COUNT(ins.id_inscripcion), 0) AS cupo_disponible
            FROM grupo_taller g
            LEFT JOIN instructor i ON g.id_instructor = i.id_instructor
            LEFT JOIN inscripcion ins ON g.id_grupo = ins.id_grupo AND UPPER(ins.estado_inscripcion) = 'ACTIVA'
            GROUP BY 
                g.id_grupo, 
                g.nombre_clase, 
                g.tipo_clase, 
                g.salon, 
                g.horario, 
                g.cupo_maximo, 
                g.costo_cuota, 
                i.nombre, 
                i.apellidos
            ORDER BY g.nombre_clase ASC, g.id_grupo ASC";

    $stmt = $pdo->query($sql);
    $grupos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'data'   => $grupos
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Error interno al consultar los aforos.'
    ]);
}
exit();