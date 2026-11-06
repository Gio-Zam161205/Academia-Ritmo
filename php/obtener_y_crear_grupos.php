<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

// A. CONSULTAR AFOROS Y LISTA DE INSTRUCTORES
if ($method === 'GET') {
    try {
        $stmtGrupos = $pdo->prepare("
            SELECT g.id_grupo, g.nombre_clase, g.tipo_clase, g.cupo_maximo, g.costo_cuota,
                   CONCAT(inst.nombre, ' ', inst.apellidos) AS nombre_instructor,
                   COUNT(i.id_inscripcion) AS ocupacion_actual,
                   (g.cupo_maximo - COUNT(i.id_inscripcion)) AS cupo_disponible
            FROM Grupo_Taller g
            INNER JOIN Instructor inst ON g.id_instructor = inst.id_instructor
            LEFT JOIN Inscripcion i ON g.id_grupo = i.id_grupo AND i.estado_inscripcion = 'ACTIVA'
            GROUP BY g.id_grupo, g.nombre_clase, g.tipo_clase, g.cupo_maximo, g.costo_cuota, inst.nombre, inst.apellidos
        ");
        $stmtGrupos->execute();
        $grupos = $stmtGrupos->fetchAll(PDO::FETCH_ASSOC);

        // Obtener la lista de instructores registrados
        $stmtInstructores = $pdo->prepare("SELECT id_instructor, CONCAT(nombre, ' ', apellidos) AS nombre_completo, especialidad FROM Instructor");
        $stmtInstructores->execute();
        $instructores = $stmtInstructores->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'status'       => 'success',
            'data'         => $grupos,
            'instructores' => $instructores
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit();
}

// B. INSERTAR TALLER CON SU INSTRUCTOR CORRESPONDIENTE
if ($method === 'POST') {
    $nombre_clase  = trim($_POST['nombre_clase'] ?? '');
    $tipo_clase    = trim($_POST['tipo_clase'] ?? 'Taller');
    $cupo_maximo   = intval($_POST['cupo_maximo'] ?? 0);
    $costo_cuota   = floatval($_POST['costo_cuota'] ?? 0);
    $id_instructor = intval($_POST['id_instructor'] ?? 0);

    if (empty($nombre_clase) || $cupo_maximo <= 0 || $id_instructor <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Selecciona un instructor válido y completa los datos del taller.']);
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

        echo json_encode([
            'status'  => 'success',
            'message' => '¡Taller "' . $nombre_clase . '" registrado y asignado correctamente!'
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error al guardar el grupo: ' . $e->getMessage()]);
    }
    exit();
}
?>