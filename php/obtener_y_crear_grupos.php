<?php
header('Content-Type: application/json; charset=utf-8');
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 569cd8ae07ecc1b02675baead4a319fe9e485cb6
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
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
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit();
}

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 569cd8ae07ecc1b02675baead4a319fe9e485cb6
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
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

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 569cd8ae07ecc1b02675baead4a319fe9e485cb6
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
        echo json_encode([
            'status'  => 'success',
            'message' => '¡Taller "' . $nombre_clase . '" registrado y asignado correctamente!'
        ]);
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
        echo json_encode(['status' => 'success', 'message' => '¡Nuevo grupo registrado exitosamente!']);
>>>>>>> 67d2bc69ae8e4f8d277a2c18d638aa84ed32fe2c
>>>>>>> 569cd8ae07ecc1b02675baead4a319fe9e485cb6
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
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
}
>>>>>>> 67d2bc69ae8e4f8d277a2c18d638aa84ed32fe2c
>>>>>>> 569cd8ae07ecc1b02675baead4a319fe9e485cb6
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
