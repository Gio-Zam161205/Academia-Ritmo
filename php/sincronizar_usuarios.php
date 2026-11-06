<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php'; // Conexión PDO[cite: 4, 8]

try {
    // Copiar automáticamente los usuarios registrados con rol INSTRUCTOR a la tabla instructor si no existen
    $sql = "INSERT INTO instructor (nombre, apellidos, especialidad)
            SELECT 
                SUBSTRING_INDEX(nombre_completo, ' ', 1) AS nombre,
                IF(LOCATE(' ', nombre_completo) > 0, SUBSTRING(nombre_completo, LOCATE(' ', nombre_completo) + 1), 'General') AS apellidos,
                'Baile General' AS especialidad
            FROM usuario 
            WHERE rol = 'INSTRUCTOR'
            AND NOT EXISTS (
                SELECT 1 FROM instructor WHERE CONCAT(nombre, ' ', apellidos) = usuario.nombre_completo
            )";
            
    $count = $pdo->exec($sql);
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Sincronización completada. Instructores agregados automáticamente: ' . $count
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>