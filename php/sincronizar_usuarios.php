<?php
// php/sincronizar_usuarios.php
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
    echo json_encode(['status' => 'error', 'message' => 'Acceso denegado: Se requieren permisos administrativos.']);
    exit();
}

// 3. Permitir únicamente GET o POST
if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'POST'], true)) {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método HTTP no permitido.']);
    exit();
}

try {
    // Copiar automáticamente los usuarios con rol INSTRUCTOR a la tabla instructor si aún no existen
    $sql = "
        INSERT INTO instructor (nombre, apellidos, especialidad)
        SELECT 
            LEFT(SUBSTRING_INDEX(TRIM(u.nombre_completo), ' ', 1), 50) AS nombre,
            LEFT(
                IF(
                    LOCATE(' ', TRIM(u.nombre_completo)) > 0,
                    TRIM(SUBSTRING(TRIM(u.nombre_completo), LOCATE(' ', TRIM(u.nombre_completo)) + 1)),
                    'General'
                ),
                50
            ) AS apellidos,
            'Baile General' AS especialidad
        FROM usuario u
        WHERE UPPER(u.rol) = 'INSTRUCTOR'
          AND TRIM(u.nombre_completo) <> ''
          AND NOT EXISTS (
              SELECT 1 
              FROM instructor i 
              WHERE LOWER(TRIM(CONCAT(i.nombre, ' ', i.apellidos))) = LOWER(TRIM(u.nombre_completo))
                 OR LOWER(TRIM(i.nombre)) = LOWER(SUBSTRING_INDEX(TRIM(u.nombre_completo), ' ', 1))
          )
    ";

    $count = $pdo->exec($sql);

    echo json_encode([
        'status'  => 'success',
        'message' => 'Sincronización completada. Instructores agregados automáticamente: ' . intval($count)
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Error interno al sincronizar usuarios con el catálogo de instructores.'
    ]);
}
exit();