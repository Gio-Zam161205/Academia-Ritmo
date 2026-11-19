<?php
// php/sincronizar_instructores.php
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

// 2. Permitir ejecución únicamente a ADMIN o RECEPCIONISTA
$rolSesion = strtoupper(trim($_SESSION['rol'] ?? ''));
if (!in_array($rolSesion, ['ADMIN', 'RECEPCIONISTA'], true)) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Acceso denegado: No tienes permisos para sincronizar instructores.']);
    exit();
}

// 3. Permitir únicamente GET o POST
if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'POST'], true)) {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método HTTP no permitido.']);
    exit();
}

try {
    $pdo->beginTransaction();

    // Buscar usuarios con rol INSTRUCTOR en la tabla usuario
    $stmt = $pdo->query("SELECT nombre_completo FROM usuario WHERE UPPER(rol) = 'INSTRUCTOR'");
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmtCheck = $pdo->prepare("
        SELECT id_instructor 
        FROM instructor 
        WHERE LOWER(TRIM(nombre)) = LOWER(?) 
          AND LOWER(TRIM(apellidos)) = LOWER(?) 
        LIMIT 1
    ");

    $stmtInsert = $pdo->prepare("
        INSERT INTO instructor (nombre, apellidos, especialidad) 
        VALUES (?, ?, 'Baile General')
    ");

    $insertados = 0;

    foreach ($usuarios as $u) {
        $nombreCompleto = preg_replace('/\s+/', ' ', trim($u['nombre_completo'] ?? ''));
        if ($nombreCompleto === '') {
            continue;
        }

        $partes    = explode(' ', $nombreCompleto);
        $nombre    = mb_substr(array_shift($partes), 0, 50);
        $apellidos = mb_substr(!empty($partes) ? implode(' ', $partes) : 'General', 0, 50);

        $stmtCheck->execute([$nombre, $apellidos]);

        if (!$stmtCheck->fetch()) {
            $stmtInsert->execute([$nombre, $apellidos]);
            $insertados++;
        }
    }

    $pdo->commit();

    echo json_encode([
        'status'  => 'success',
        'message' => "Sincronización finalizada. Se agregaron {$insertados} instructores al catálogo."
    ]);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Error interno al sincronizar los instructores.'
    ]);
}
exit();