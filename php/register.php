<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php'; // Conexión PDO centralizada[cite: 4]

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Lectura flexible: acepta tanto nombres en español como en inglés
    $nombre_completo = trim($_POST['nombre_completo'] ?? $_POST['fullname'] ?? '');
    $correo          = trim($_POST['correo'] ?? $_POST['username'] ?? '');
    $password        = $_POST['password'] ?? '';
    $rol             = strtoupper(trim($_POST['rol'] ?? $_POST['role'] ?? ''));

    // Validar campos requeridos
    if (empty($nombre_completo) || empty($correo) || empty($password) || empty($rol)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Por favor completa todos los campos del formulario.']);
        exit();
    }

    try {
        $pdo->beginTransaction();

        // 1. Verificar si el correo ya está registrado[cite: 4]
        $stmtCheck = $pdo->prepare("SELECT id_usuario FROM Usuario WHERE correo = ?");
        $stmtCheck->execute([$correo]);
        if ($stmtCheck->fetch()) {
            $pdo->rollBack();
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'El correo electrónico ya se encuentra registrado.']);
            exit();
        }

        // 2. Insertar en la tabla Usuario con hash Bcrypt[cite: 9]
        $password_hash = password_hash($password, PASSWORD_BCRYPT);
        $stmtUser = $pdo->prepare("INSERT INTO Usuario (nombre_completo, correo, password_hash, rol) VALUES (?, ?, ?, ?)");
        $stmtUser->execute([$nombre_completo, $correo, $password_hash, $rol]);

        // 3. Si el rol es INSTRUCTOR, creamos automáticamente su registro en la tabla Instructor
        if ($rol === 'INSTRUCTOR') {
            $partes = explode(' ', $nombre_completo);
            $nombre = array_shift($partes);
            $apellidos = !empty($partes) ? implode(' ', $partes) : 'General';

            $stmtInst = $pdo->prepare("INSERT INTO Instructor (nombre, apellidos, especialidad) VALUES (?, ?, 'Baile General')");
            $stmtInst->execute([$nombre, $apellidos]);
        }

        $pdo->commit();

        echo json_encode([
            'status' => 'success',
            'message' => '¡Usuario registrado exitosamente como ' . $rol . '! Ya puedes iniciar sesión.'
        ]);

    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
    }
    exit();
}
?>