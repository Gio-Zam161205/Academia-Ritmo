<?php
// php/obtener_lista_asistencia.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php'; // Conexión PDO centralizada

$id_grupo = intval($_GET['id_grupo'] ?? 0);

if ($id_grupo <= 0) {
    echo json_encode(['status' => 'error', 'message' => 'Se requiere especificar un taller/grupo.']);
    exit();
}

try {
    // Consulta la Vista de Solvencia para mostrar la lista de la clase
    $stmt = $pdo->prepare("SELECT id_alumno, CONCAT(nombre, ' ', apellidos) AS nombre_completo, estatus_pago FROM vw_estatus_pago_alumnos WHERE id_grupo = ?");
    $stmt->execute([$id_grupo]);
    $listaAlumnos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'data' => $listaAlumnos]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Error al consultar la lista: ' . $e->getMessage()]);
}
exit();
?>