<?php
header('Content-Type: application/json; charset=utf-8');
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 569cd8ae07ecc1b02675baead4a319fe9e485cb6
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

<<<<<<< HEAD
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
=======
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
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e

        echo json_encode([
            'status'       => 'success',
            'data'         => $grupos,
            'instructores' => $instructores
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
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
>>>>>>> 67d2bc69ae8e4f8d277a2c18d638aa84ed32fe2c
>>>>>>> 569cd8ae07ecc1b02675baead4a319fe9e485cb6
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit();
}

<<<<<<< HEAD
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
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 569cd8ae07ecc1b02675baead4a319fe9e485cb6
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
// B. REGISTRAR UN NUEVO GRUPO / TALLER DESDE RECEPCIÓN
if ($method === 'POST') {
    $nombre_clase = trim($_POST['nombre_clase'] ?? '');
    $tipo_clase   = trim($_POST['tipo_clase'] ?? 'Regular');
    $cupo_maximo  = intval($_POST['cupo_maximo'] ?? 0);
    $costo_cuota  = floatval($_POST['costo_cuota'] ?? 0);
    $id_instructor= intval($_POST['id_instructor'] ?? 1); // Instructor por defecto

    if (empty($nombre_clase) || $cupo_maximo <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Proporcione un nombre válido y un cupo mayor a cero.']);
>>>>>>> 67d2bc69ae8e4f8d277a2c18d638aa84ed32fe2c
>>>>>>> 569cd8ae07ecc1b02675baead4a319fe9e485cb6
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
        exit();
    }

    try {
<<<<<<< HEAD
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
=======
        $stmt = $pdo->prepare("INSERT INTO Grupo_Taller (nombre_clase, tipo_clase, cupo_maximo, costo_cuota, id_instructor) 
                                VALUES (:nombre, :tipo, :cupo, :costo, :inst)");
        $stmt->execute([
            ':nombre' => $nombre_clase,
            ':tipo'   => $tipo_clase,
            ':cupo'   => $cupo_maximo,
            ':costo'  => $costo_cuota,
            ':inst'   => $id_instructor
        ]);

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 569cd8ae07ecc1b02675baead4a319fe9e485cb6
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
        echo json_encode([
            'status'  => 'success',
            'message' => '¡Taller "' . $nombre_clase . '" registrado y asignado correctamente!'
        ]);
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
        echo json_encode(['status' => 'success', 'message' => '¡Nuevo grupo registrado exitosamente!']);
>>>>>>> 67d2bc69ae8e4f8d277a2c18d638aa84ed32fe2c
>>>>>>> 569cd8ae07ecc1b02675baead4a319fe9e485cb6
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error al guardar el grupo: ' . $e->getMessage()]);
    }
    exit();
<<<<<<< HEAD
}
?>
=======
<<<<<<< HEAD
}
?>
=======
<<<<<<< HEAD
}
?>
=======
<<<<<<< HEAD
}
?>
=======
<<<<<<< HEAD
}
?>
=======
}
>>>>>>> 67d2bc69ae8e4f8d277a2c18d638aa84ed32fe2c
>>>>>>> 569cd8ae07ecc1b02675baead4a319fe9e485cb6
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
>>>>>>> 98bbc6150e01110494e4aa87ea4db583b0a4a24e
