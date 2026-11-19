<?php
// php/registrar_pago_adeudo.php
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

// 2. Permitir únicamente método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método HTTP no permitido.']);
    exit();
}

// 3. Validar parámetros de entrada
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

    // 4. Verificar inscripción activa, costo del taller y saldo pendiente real en BD
    $sqlSaldo = "
        SELECT 
            g.nombre_clase,
            g.costo_cuota,
            IFNULL(SUM(p.monto), 0) AS monto_pagado,
            (g.costo_cuota - IFNULL(SUM(p.monto), 0)) AS adeudo_real
        FROM inscripcion i
        INNER JOIN grupo_taller g ON i.id_grupo = g.id_grupo
        LEFT JOIN pago p ON i.id_alumno = p.id_alumno AND i.id_grupo = p.id_grupo
        WHERE i.id_alumno = :alumno 
          AND i.id_grupo = :grupo 
          AND UPPER(i.estado_inscripcion) = 'ACTIVA'
        GROUP BY g.id_grupo, g.nombre_clase, g.costo_cuota
        LIMIT 1
    ";
    $stmtSaldo = $pdo->prepare($sqlSaldo);
    $stmtSaldo->execute([
        ':alumno' => $id_alumno,
        ':grupo'  => $id_grupo
    ]);
    $registro = $stmtSaldo->fetch(PDO::FETCH_ASSOC);

    if (!$registro) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode([
            'status'  => 'error',
            'message' => 'El alumno no tiene una inscripción activa en este taller.'
        ]);
        exit();
    }

    $adeudoReal = round(floatval($registro['adeudo_real']), 2);

    if ($adeudoReal <= 0) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode([
            'status'  => 'error',
            'message' => 'Este alumno ya se encuentra SOLVENTE; no tiene adeudos pendientes.'
        ]);
        exit();
    }

    // Evitar cobrar de más si se envió un monto superior al saldo real
    $montoACobrar = min(round($monto, 2), $adeudoReal);
    $concepto = mb_substr('Liquidación de adeudo: ' . ($registro['nombre_clase'] ?? 'Taller'), 0, 100);

    // 5. Insertar el pago en la tabla pago
    $stmtPago = $pdo->prepare("
        INSERT INTO pago (id_alumno, id_grupo, fecha_pago, monto, concepto) 
        VALUES (:alumno, :grupo, CURRENT_DATE(), :monto, :concepto)
    ");
    $stmtPago->execute([
        ':alumno'   => $id_alumno,
        ':grupo'    => $id_grupo,
        ':monto'    => $montoACobrar,
        ':concepto' => $concepto
    ]);

    $pdo->commit();

    $saldoRestante = round($adeudoReal - $montoACobrar, 2);
    $mensajeFinal = $saldoRestante <= 0
        ? '¡Pago registrado correctamente! El alumno ahora figura como SOLVENTE.'
        : '¡Abono de $' . number_format($montoACobrar, 2) . ' registrado! Saldo pendiente: $' . number_format($saldoRestante, 2) . '.';

    echo json_encode([
        'status'  => 'success',
        'message' => $mensajeFinal
    ]);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Error interno al guardar el pago en la base de datos.'
    ]);
}
exit();