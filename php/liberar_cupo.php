<?php
header('Content-Type: application/json; charset=utf-8');
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 569cd8ae07ecc1b02675baead4a319fe9e485cb6
require_once '../config/db.php'; // Conexión PDO centralizada

$method = $_SERVER['REQUEST_METHOD'];

// A. LISTAR INSCRIPCIONES ACTIVAS PARA EL SELECT
if ($method === 'GET' && isset($_GET['accion']) && $_GET['accion'] === 'listar') {
    try {
        $stmt = $pdo->query("SELECT i.id_inscripcion, CONCAT(a.nombre, ' ', a.apellidos) AS alumno, g.nombre_clase 
                             FROM Inscripcion i 
                             JOIN Alumno a ON i.id_alumno = a.id_alumno 
                             JOIN Grupo_Taller g ON i.id_grupo = g.id_grupo 
                             WHERE i.estado_inscripcion = 'ACTIVA'");
        echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit();
}

// B. CANCELAR INSCRIPCIÓN Y LIBERAR CUPO
if ($method === 'POST') {
    $id_inscripcion = $_POST['id_inscripcion'] ?? null;
    if (!$id_inscripcion) {
        echo json_encode(['status' => 'error', 'message' => 'Selecciona una inscripción válida.']);
        exit();
    }

    try {
        $stmt = $pdo->prepare("UPDATE Inscripcion SET estado_inscripcion = 'CANCELADA' WHERE id_inscripcion = ?");
        $stmt->execute([$id_inscripcion]);
        echo json_encode(['status' => 'success', 'message' => 'Cupo liberado con éxito. La inscripción se marcó como CANCELADA.']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit();
<<<<<<< HEAD
=======
=======
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
>>>>>>> 67d2bc69ae8e4f8d277a2c18d638aa84ed32fe2c
>>>>>>> 569cd8ae07ecc1b02675baead4a319fe9e485cb6
}
?>