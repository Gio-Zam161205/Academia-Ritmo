<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php'; // Conexión PDO[cite: 4, 8]

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_alumno = intval($_POST['id_alumno'] ?? 0);
    $id_grupo  = intval($_POST['id_grupo'] ?? 0);
    $monto     = floatval($_POST['monto'] ?? 0);

    if ($id_alumno <= 0 || $id_grupo <= 0 || $monto <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Parámetros inválidos para procesar el pago.']);
        exit();
    }

    try {
        $pdo->beginTransaction();

        // 1. Obtener el nombre del taller para el concepto del pago
        $stmtG = $pdo->prepare("SELECT nombre_clase FROM Grupo_Taller WHERE id_grupo = ?");
        $stmtG->execute([$id_grupo]);
        $grupo = $stmtG->fetch(PDO::FETCH_ASSOC);
        $concepto = "Liquidación de adeudo: " . ($grupo['nombre_clase'] ?? 'Taller');

        // 2. Insertar el pago en la tabla Pago (Esto cambia automáticamente el estatus a Solvente)
        $stmtPago = $pdo->prepare("INSERT INTO Pago (id_alumno, id_grupo, fecha_pago, monto, concepto) VALUES (?, ?, CURRENT_DATE(), ?, ?)");
        $stmtPago->execute([$id_alumno, $id_grupo, $monto, $concepto]);

        $pdo->commit();

        echo json_encode([
            'status' => 'success',
            'message' => '¡Pago registrado correctamente! El alumno ahora figura como SOLVENTE.'
        ]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error al guardar el pago: ' . $e->getMessage()]);
    }
    exit();
}
?>