<?php
// php/obtener_lista_asistencia.php
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

// 3. Validar parámetro id_grupo
$id_grupo = intval($_GET['id_grupo'] ?? 0);

if ($id_grupo <= 0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Se requiere especificar un taller/grupo válido.']);
    exit();
}

try {
    // Calcula el estatus de pago en tiempo real (Solvente / Pendiente) sin exponer montos
    $sql = "
        SELECT 
            a.id_alumno, 
            CONCAT(a.nombre, ' ', a.apellidos) AS nombre_completo, 
            CASE 
                WHEN IFNULL(SUM(p.monto), 0) >= g.costo_cuota THEN 'Solvente'
                ELSE 'Pendiente'
            END AS estatus_pago
        FROM alumno a
        INNER JOIN inscripcion i ON a.id_alumno = i.id_alumno AND UPPER(i.estado_inscripcion) = 'ACTIVA'
        INNER JOIN grupo_taller g ON i.id_grupo = g.id_grupo
        LEFT JOIN pago p ON a.id_alumno = p.id_alumno AND g.id_grupo = p.id_grupo
        WHERE i.id_grupo = :grupo
        GROUP BY a.id_alumno, a.nombre, a.apellidos, g.costo_cuota
        ORDER BY a.apellidos ASC, a.nombre ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':grupo' => $id_grupo]);
    $listaAlumnos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'data'   => $listaAlumnos
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Error interno al consultar la lista de asistencia.'
    ]);
}
exit();