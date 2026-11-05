<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php'; // Conexión PDO[cite: 4]

try {
    // Busca usuarios con rol INSTRUCTOR que aún no existan en la tabla Instructor[cite: 4, 9]
    $stmt = $pdo->query("SELECT nombre_completo FROM Usuario WHERE rol = 'INSTRUCTOR'");
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $insertados = 0;
    foreach ($usuarios as $u) {
        $partes = explode(' ', trim($u['nombre_completo']));
        $nombre = array_shift($partes);
        $apellidos = !empty($partes) ? implode(' ', $partes) : 'General';

        // Validar si ya existe en la tabla Instructor
        $check = $pdo->prepare("SELECT id_instructor FROM Instructor WHERE nombre = ? AND apellidos = ?");
        $check->execute([$nombre, $apellidos]);
        
        if (!$check->fetch()) {
            $ins = $pdo->prepare("INSERT INTO Instructor (nombre, apellidos, especialidad) VALUES (?, ?, 'Baile General')");
            $ins->execute([$nombre, $apellidos]);
            $insertados++;
        }
    }

    echo json_encode([
        'status' => 'success',
        'message' => "Sincronización finalizada. Se agregaron {$insertados} instructores al catálogo."
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>