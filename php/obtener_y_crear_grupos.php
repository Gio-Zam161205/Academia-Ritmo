<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

// A. OBTENER TALLERES, SALONES, HORARIOS E INSTRUCTORES (GET)
if ($method === 'GET') {
    try {
        // Consulta de grupos incluyendo Salón, Horario y Nombre del Instructor
        $sqlGrupos = "
            SELECT 
                g.id_grupo, 
                g.nombre_clase, 
                g.tipo_clase, 
                g.cupo_maximo, 
                g.costo_cuota,
                COALESCE(g.salon, 'Sala A') AS salon,
                COALESCE(g.horario, '18:00 - 19:30') AS horario,
                g.id_instructor,
                CONCAT(i.nombre, ' ', i.apellidos) AS nombre_instructor,
                COUNT(ins.id_inscripcion) AS ocupacion_actual,
                (g.cupo_maximo - COUNT(ins.id_inscripcion)) AS cupo_disponible
            FROM grupo_taller g
            LEFT JOIN instructor i ON g.id_instructor = i.id_instructor
            LEFT JOIN inscripcion ins ON g.id_grupo = ins.id_grupo AND ins.estado_inscripcion = 'ACTIVA'
            GROUP BY g.id_grupo, g.nombre_clase, g.tipo_clase, g.cupo_maximo, g.costo_cuota, g.salon, g.horario, g.id_instructor, i.nombre, i.apellidos
        ";
        
        $stmtG = $pdo->query($sqlGrupos);
        $grupos = $stmtG->fetchAll(PDO::FETCH_ASSOC);

        // Consultar la lista de todos los instructores registrados en la BD
        $sqlInst = "SELECT id_instructor, CONCAT(nombre, ' ', apellidos) AS nombre_completo, especialidad FROM instructor";
        $stmtI = $pdo->query($sqlInst);
        $instructores = $stmtI->fetchAll(PDO::FETCH_ASSOC);

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

// B. REGISTRAR UN NUEVO TALLER CON SU SALÓN, HORARIO E INSTRUCTOR (POST)
if ($method === 'POST') {
    $nombre_clase  = trim($_POST['nombre_clase'] ?? '');
    $salon         = trim($_POST['salon'] ?? 'Sala A');
    $horario       = trim($_POST['horario'] ?? '18:00 - 19:30');
    $tipo_clase    = trim($_POST['tipo_clase'] ?? 'Taller');
    $cupo_maximo   = intval($_POST['cupo_maximo'] ?? 0);
    $costo_cuota   = floatval($_POST['costo_cuota'] ?? 0);
    $id_instructor = intval($_POST['id_instructor'] ?? 1);

    if (empty($nombre_clase) || $cupo_maximo <= 0 || $costo_cuota <= 0 || $id_instructor <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Por favor completa todos los campos obligatorios del taller.']);
        exit();
    }

    try {
        $sql = "INSERT INTO grupo_taller (nombre_clase, salon, horario, tipo_clase, cupo_maximo, costo_cuota, id_instructor) 
                VALUES (:nombre, :salon, :horario, :tipo, :cupo, :costo, :inst)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':nombre'  => $nombre_clase,
            ':salon'   => $salon,
            ':horario' => $horario,
            ':tipo'    => $tipo_clase,
            ':cupo'    => $cupo_maximo,
            ':costo'   => $costo_cuota,
            ':inst'    => $id_instructor
        ]);

        echo json_encode([
            'status'  => 'success',
            'message' => '¡Taller "' . $nombre_clase . '" creado correctamente en ' . $salon . ' (' . $horario . ')!'
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error al guardar el grupo: ' . $e->getMessage()]);
    }
    exit();
}
?>