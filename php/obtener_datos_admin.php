<?php
// php/obtener_datos_admin.php
ob_start();
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
session_start();
require_once '../config/db.php';

ob_clean();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Sesión no iniciada.']);
    exit();
}

try {
    // 1. Total Alumnos Activos
    $stmtA = $pdo->query("SELECT COUNT(DISTINCT id_alumno) AS total FROM inscripcion WHERE estado_inscripcion = 'ACTIVA'");
    $totalAlumnos = intval(($stmtA->fetch(PDO::FETCH_ASSOC))['total'] ?? 0);

    // 2. Monto Total Recaudado
    $stmtM = $pdo->query("SELECT IFNULL(SUM(monto), 0) AS total FROM pago");
    $totalMonto = floatval(($stmtM->fetch(PDO::FETCH_ASSOC))['total'] ?? 0);

    // 3. Consultar Registros de la Tabla log_acceso
    $sqlLogs = "
        SELECT 
            usuario,
            correo,
            rol,
            DATE_FORMAT(fecha_hora, '%d/%m/%Y - %H:%i hrs') AS fecha_formateada,
            ip_dispositivo,
            estado
        FROM log_acceso
        ORDER BY id_log DESC
        LIMIT 20
    ";
    $stmtL = $pdo->query($sqlLogs);
    $logs = $stmtL->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'kpis'   => [
            'total_alumnos'   => $totalAlumnos,
            'monto_recaudado' => '$' . number_format($totalMonto, 2, '.', ',')
        ],
        'logs'   => $logs
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Error SQL: ' . $e->getMessage()]);
}
exit();
?>