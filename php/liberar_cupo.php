<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET' && isset($_GET['accion']) && $_GET['accion'] == 'listar') {
    $stmt = $pdo->query("SELECT i.id_inscripcion, CONCAT(a.nombre, ' ', a.apellidos) as alumno, g.nombre_clase 
                         FROM Inscripcion i 
                         JOIN Alumno a ON i.id_alumno = a.id_alumno 
                         JOIN Grupo_Taller g ON i.id_grupo = g.id_grupo 
                         WHERE i.estado_inscripcion = 'ACTIVA'");
    echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll()]);
    exit;
}

if ($method === 'POST') {
    $id = $_POST['id_inscripcion'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("UPDATE Inscripcion SET estado_inscripcion = 'CANCELADA' WHERE id_inscripcion = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'success', 'message' => 'Cupo liberado correctamente.']);
    }
}
?>