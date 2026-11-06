<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php'; // Conexión PDO centralizada

$method = $_SERVER['REQUEST_METHOD'];

// A. LISTAR INSCRIPCIONES ACTIVAS PARA EL SELECT
if ($method === 'GET' && isset($_GET['accion']) && $_GET['accion'] === 'listar') {
    try {
        // Usamos LEFT JOIN para garantizar que traiga a los alumnos inscritos aunque falten relaciones
        $sql = "SELECT 
                    i.id_inscripcion, 
                    COALESCE(CONCAT(a.nombre, ' ', a.apellidos), 'Alumno Registrado') AS alumno, 
                    g.nombre_clase 
                FROM Inscripcion i 
                INNER JOIN Grupo_Taller g ON i.id_grupo = g.id_grupo 
                LEFT JOIN Alumno a ON i.id_alumno = a.id_alumno 
                WHERE UPPER(i.estado_inscripcion) = 'ACTIVA'";

        $stmt = $pdo->query($sql);
        $inscripciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['status' => 'success', 'data' => $inscripciones]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error en consulta: ' . $e->getMessage()]);
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
        echo json_encode(['status' => 'success', 'message' => '¡Cupo liberado con éxito! La inscripción se marcó como CANCELADA.']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error al liberar cupo: ' . $e->getMessage()]);
    }
    exit();
}
?>