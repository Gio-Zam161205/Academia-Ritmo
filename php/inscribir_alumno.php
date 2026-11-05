<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php'; // Conexión PDO[cite: 4, 8]

$id_alumno = $_POST['id_alumno'] ?? null;
$id_grupo = $_POST['id_grupo'] ?? null;

if (!$id_alumno || !$id_grupo) {
    echo json_encode(['status' => 'error', 'message' => 'Faltan parámetros obligatorios.']);
    exit;
}

try {
    // Insertar la inscripción (El Trigger tg_bloquear_sobrecupo se activará automáticamente si cupo_disponible <= 0)[cite: 1, 6]
    $stmt = $pdo->prepare("INSERT INTO Inscripcion (id_alumno, id_grupo, fecha_registro, estado_inscripcion) VALUES (:id_alumno, :id_grupo, CURRENT_DATE(), 'ACTIVA')");
    $stmt->execute([
        ':id_alumno' => $id_alumno,
        ':id_grupo'  => $id_grupo
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Inscripción registrada correctamente en la base de datos central.']);
} catch (PDOException $e) {
    // Captura de la excepción emitida por el Trigger SQL tg_bloquear_sobrecupo[cite: 1, 6]
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Error al inscribir: ' . $e->getMessage()]);
}