<?php
// php/obtener_y_crear_grupos.php
ob_start();
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
session_start();
require_once '../config/db.php';

if (ob_get_length()) {
    ob_clean();
}

// 1. Verificar sesión activa
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Sesión no iniciada o expirada.']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

// A. OBTENER TALLERES, SALONES, HORARIOS E INSTRUCTORES (GET)
if ($method === 'GET') {
    try {
        $sqlGrupos = "
            SELECT 
                g.id_grupo, 
                g.nombre_clase, 
                g.tipo_clase, 
                g.cupo_maximo, 
                g.costo_cuota,
                COALESCE(NULLIF(TRIM(g.salon), ''), 'Sala A') AS salon,
                COALESCE(NULLIF(TRIM(g.horario), ''), '18:00 - 19:30') AS horario,
                g.id_instructor,
                COALESCE(
                    NULLIF(TRIM(CONCAT(IFNULL(i.nombre, ''), ' ', IFNULL(i.apellidos, ''))), ''),
                    'Sin Asignar'
                ) AS nombre_instructor,
                COUNT(ins.id_inscripcion) AS ocupacion_actual,
                GREATEST(g.cupo_maximo - COUNT(ins.id_inscripcion), 0) AS cupo_disponible
            FROM grupo_taller g
            LEFT JOIN instructor i ON g.id_instructor = i.id_instructor
            LEFT JOIN inscripcion ins ON g.id_grupo = ins.id_grupo AND UPPER(ins.estado_inscripcion) = 'ACTIVA'
            GROUP BY 
                g.id_grupo, 
                g.nombre_clase, 
                g.tipo_clase, 
                g.cupo_maximo, 
                g.costo_cuota, 
                g.salon, 
                g.horario, 
                g.id_instructor, 
                i.nombre, 
                i.apellidos
            ORDER BY g.nombre_clase ASC, g.id_grupo ASC
        ";

        $stmtG = $pdo->query($sqlGrupos);
        $grupos = $stmtG->fetchAll(PDO::FETCH_ASSOC);

        // Consultar la lista de todos los instructores registrados en la BD
        $sqlInst = "
            SELECT 
                id_instructor, 
                CONCAT(nombre, ' ', apellidos) AS nombre_completo, 
                especialidad 
            FROM instructor
            ORDER BY nombre ASC, apellidos ASC
        ";
        $stmtI = $pdo->query($sqlInst);
        $instructores = $stmtI->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'status'       => 'success',
            'data'         => $grupos,
            'instructores' => $instructores
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error interno al consultar grupos e instructores.']);
    }
    exit();
}

// B. REGISTRAR UN NUEVO TALLER CON SU SALÓN, HORARIO E INSTRUCTOR (POST)
if ($method === 'POST') {
    $nombre_clase  = trim($_POST['nombre_clase'] ?? '');
    $salon         = trim($_POST['salon'] ?? '');
    $horario       = trim($_POST['horario'] ?? '');
    $tipo_clase    = trim($_POST['tipo_clase'] ?? 'Taller');
    $cupo_maximo   = intval($_POST['cupo_maximo'] ?? 0);
    $costo_cuota   = isset($_POST['costo_cuota']) && $_POST['costo_cuota'] !== '' ? floatval($_POST['costo_cuota']) : -1;
    $id_instructor = intval($_POST['id_instructor'] ?? 0);

    if ($salon === '') {
        $salon = 'Sala A';
    }
    if ($horario === '') {
        $horario = '18:00 - 19:30';
    }
    if ($tipo_clase === '') {
        $tipo_clase = 'Taller';
    }

    if ($nombre_clase === '' || $cupo_maximo <= 0 || $costo_cuota < 0 || $id_instructor <= 0) {
        http_response_code(400);
        echo json_encode([
            'status'  => 'error',
            'message' => 'Por favor completa correctamente todos los campos obligatorios del taller.'
        ]);
        exit();
    }

    // Recortar longitudes según esquema de BD
    $nombre_clase = mb_substr($nombre_clase, 0, 50);
    $salon        = mb_substr($salon, 0, 50);
    $horario      = mb_substr($horario, 0, 50);
    $tipo_clase   = mb_substr($tipo_clase, 0, 30);

    try {
        // Verificar que el instructor exista antes de insertar
        $stmtCheckInst = $pdo->prepare("SELECT id_instructor FROM instructor WHERE id_instructor = ? LIMIT 1");
        $stmtCheckInst->execute([$id_instructor]);
        if (!$stmtCheckInst->fetch()) {
            http_response_code(400);
            echo json_encode([
                'status'  => 'error',
                'message' => 'El instructor seleccionado no existe en el catálogo.'
            ]);
            exit();
        }

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
            'message' => "¡Taller \"{$nombre_clase}\" creado correctamente en {$salon} ({$horario})!"
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error interno al guardar el grupo en la base de datos.']);
    }
    exit();
}

// C. Cualquier otro método HTTP
http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Método HTTP no permitido.']);
exit();