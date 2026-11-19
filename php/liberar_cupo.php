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

$method = $_SERVER['REQUEST_METHOD'];

// A. LISTAR INSCRIPCIONES ACTIVAS PARA EL SELECT
if ($method === 'GET' && isset($_GET['accion']) && $_GET['accion'] === 'listar') {
    try {
        $sql = "SELECT 
                    i.id_inscripcion, 
                    COALESCE(NULLIF(TRIM(CONCAT(a.nombre, ' ', a.apellidos)), ''), 'Alumno Registrado') AS alumno, 
                    g.nombre_clase 
                FROM inscripcion i 
                INNER JOIN grupo_taller g ON i.id_grupo = g.id_grupo 
                LEFT JOIN alumno a ON i.id_alumno = a.id_alumno 
                WHERE UPPER(i.estado_inscripcion) = 'ACTIVA'
                ORDER BY alumno ASC, g.nombre_clase ASC";

        $stmt = $pdo->query($sql);
        $inscripciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['status' => 'success', 'data' => $inscripciones]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error al consultar inscripciones activas.']);
    }
    exit();
}

// B. CANCELAR INSCRIPCIÓN Y LIBERAR CUPO
if ($method === 'POST') {
    $id_inscripcion = intval($_POST['id_inscripcion'] ?? 0);

    if ($id_inscripcion <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Selecciona una inscripción válida.']);
        exit();
    }

    try {
        // Verificar que exista y esté activa antes de cancelar
        $stmtCheck = $pdo->prepare("SELECT estado_inscripcion FROM inscripcion WHERE id_inscripcion = ? LIMIT 1");
        $stmtCheck->execute([$id_inscripcion]);
        $inscripcion = $stmtCheck->fetch(PDO::FETCH_ASSOC);

        if (!$inscripcion) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'La inscripción seleccionada no existe.']);
            exit();
        }

        if (strtoupper($inscripcion['estado_inscripcion']) !== 'ACTIVA') {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Esta inscripción ya fue cancelada anteriormente.']);
            exit();
        }

        $stmt = $pdo->prepare("UPDATE inscripcion SET estado_inscripcion = 'CANCELADA' WHERE id_inscripcion = ?");
        $stmt->execute([$id_inscripcion]);

        echo json_encode([
            'status'  => 'success',
            'message' => '¡Cupo liberado con éxito! La inscripción se marcó como CANCELADA.'
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error interno al liberar el cupo.']);
    }
    exit();
}

// C. Cualquier otro método o acción inválida
http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Solicitud o método HTTP no permitido.']);
exit();