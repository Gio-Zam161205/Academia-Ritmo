<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php'; // Conexión PDO centralizada[cite: 4, 8, 9]

$method = $_SERVER['REQUEST_METHOD'];

// A. OBTENER GRUPOS Y ALUMNOS PARA LA RECEPCIÓN
if ($method === 'GET') {
    try {
        // Obtener la lista de grupos registrados
        $stmtGrupos = $pdo->prepare("SELECT id_grupo, nombre_clase, tipo_clase, cupo_maximo, costo_cuota FROM Grupo_Taller");
        $stmtGrupos->execute();
        $grupos = $stmtGrupos->fetchAll(PDO::FETCH_ASSOC);

        // Obtener la lista de alumnos registrados para la selección
        $stmtAlumnos = $pdo->prepare("SELECT id_alumno, nombre, apellidos FROM Alumno");
        $stmtAlumnos->execute();
        $alumnos = $stmtAlumnos->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'status' => 'success',
            'grupos' => $grupos,
            'alumnos' => $alumnos
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit();
}

// B. REGISTRAR UN NUEVO GRUPO / TALLER DESDE RECEPCIÓN
if ($method === 'POST') {
    $nombre_clase = trim($_POST['nombre_clase'] ?? '');
    $tipo_clase   = trim($_POST['tipo_clase'] ?? 'Regular');
    $cupo_maximo  = intval($_POST['cupo_maximo'] ?? 0);
    $costo_cuota  = floatval($_POST['costo_cuota'] ?? 0);
    $id_instructor= intval($_POST['id_instructor'] ?? 1); // Instructor por defecto

    if (empty($nombre_clase) || $cupo_maximo <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Proporcione un nombre válido y un cupo mayor a cero.']);
        exit();
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO Grupo_Taller (nombre_clase, tipo_clase, cupo_maximo, costo_cuota, id_instructor) 
                                VALUES (:nombre, :tipo, :cupo, :costo, :inst)");
        $stmt->execute([
            ':nombre' => $nombre_clase,
            ':tipo'   => $tipo_clase,
            ':cupo'   => $cupo_maximo,
            ':costo'  => $costo_cuota,
            ':inst'   => $id_instructor
        ]);

        echo json_encode(['status' => 'success', 'message' => '¡Nuevo grupo registrado exitosamente!']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error al guardar el grupo: ' . $e->getMessage()]);
    }
    exit();
}