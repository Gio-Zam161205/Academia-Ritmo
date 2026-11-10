<?php
// Limpiar búfer y desactivar salida de errores cruda en pantalla
ob_start();
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
session_start();
require_once '../config/db.php';

// Limpiar cualquier texto previo al JSON
ob_clean();

// 1. Validar si existe sesión iniciada
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'No hay sesión activa.']);
    exit();
}

$id_usuario     = $_SESSION['user_id'];
$nombre_usuario = $_SESSION['nombre'] ?? $_SESSION['nombre_completo'] ?? 'Docente';
$rol_usuario    = $_SESSION['rol'] ?? 'INSTRUCTOR';

// 2. Obtener el id_instructor real buscando por el nombre del usuario en sesión
$id_instructor = 1; // Valor por defecto

if ($nombre_usuario !== 'Docente') {
    $primer_nombre = explode(' ', trim($nombre_usuario))[0];
    $stmtInst = $pdo->prepare("SELECT id_instructor FROM instructor WHERE LOWER(nombre) LIKE LOWER(:nombre) ORDER BY id_instructor ASC LIMIT 1");
    $stmtInst->execute([':nombre' => '%' . $primer_nombre . '%']);
    $resInst = $stmtInst->fetch(PDO::FETCH_ASSOC);

    if ($resInst) {
        $id_instructor = $resInst['id_instructor'];
    }
}

// Generar iniciales para el avatar (ej: "Gio Instructor" -> "GI")
$partes = explode(' ', trim($nombre_usuario));
$iniciales = strtoupper(substr($partes[0], 0, 1));
if (count($partes) > 1) {
    $iniciales .= strtoupper(substr($partes[count($partes) - 1], 0, 1));
}

$method = $_SERVER['REQUEST_METHOD'];

// --------------------------------------------------------------------------
// A. OBTENER PERFIL, GRUPOS Y NÓMINA DE ALUMNOS DEL INSTRUCTOR (GET)
// --------------------------------------------------------------------------
if ($method === 'GET') {
    try {
        // 1. Obtener los talleres/clases asignados a ESTE instructor en específico
        $sqlGrupos = "
            SELECT 
                g.id_grupo, 
                g.nombre_clase, 
                COALESCE(g.salon, 'Sala A') AS salon, 
                COALESCE(g.horario, '18:00 - 19:30') AS horario
            FROM grupo_taller g
            WHERE g.id_instructor = :inst
        ";
        $stmtG = $pdo->prepare($sqlGrupos);
        $stmtG->execute([':inst' => $id_instructor]);
        $grupos = $stmtG->fetchAll(PDO::FETCH_ASSOC);

        // 2. Determinar grupo seleccionado (por defecto el primero asignado)
        $id_grupo_sel = intval($_GET['id_grupo'] ?? ($grupos[0]['id_grupo'] ?? 0));
        $alumnos = [];

        if ($id_grupo_sel > 0) {
            // Consulta de solvencia financiera (Solvente / Pendiente)
            $sqlAlumnos = "
                SELECT 
                    a.id_alumno,
                    CONCAT(a.nombre, ' ', a.apellidos) AS nombre_completo,
                    CASE 
                        WHEN IFNULL(SUM(p.monto), 0) >= g.costo_cuota THEN 'Solvente'
                        ELSE 'Pendiente'
                    END AS estado_pago
                FROM alumno a
                INNER JOIN inscripcion i ON a.id_alumno = i.id_alumno AND i.estado_inscripcion = 'ACTIVA'
                INNER JOIN grupo_taller g ON i.id_grupo = g.id_grupo
                LEFT JOIN pago p ON a.id_alumno = p.id_alumno AND g.id_grupo = p.id_grupo
                WHERE i.id_grupo = :grupo
                GROUP BY a.id_alumno, a.nombre, a.apellidos, g.costo_cuota
                ORDER BY a.apellidos ASC, a.nombre ASC
            ";
            $stmtA = $pdo->prepare($sqlAlumnos);
            $stmtA->execute([':grupo' => $id_grupo_sel]);
            $alumnos = $stmtA->fetchAll(PDO::FETCH_ASSOC);
        }

        echo json_encode([
            'status'     => 'success',
            'usuario'    => [
                'nombre'    => $nombre_usuario,
                'rol'       => ucfirst(strtolower($rol_usuario)),
                'iniciales' => $iniciales
            ],
            'grupos'     => $grupos,
            'id_grupo'   => $id_grupo_sel,
            'alumnos'    => $alumnos
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error SQL: ' . $e->getMessage()]);
    }
    exit();
}

// --------------------------------------------------------------------------
// B. ALMACENAR LA LISTA DE ASISTENCIA EN MYSQL (POST)
// --------------------------------------------------------------------------
if ($method === 'POST') {
    $inputRaw = file_get_contents('php://input');
    $data = json_decode($inputRaw, true);

    $id_grupo = intval($data['id_grupo'] ?? 0);
    $asistencias = $data['asistencias'] ?? [];
    $fecha_actual = date('Y-m-d');

    if ($id_grupo <= 0 || empty($asistencias)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Parámetros incompletos para guardar la asistencia.']);
        exit();
    }

    try {
        $pdo->beginTransaction();

        // Eliminar lista previa del mismo día y grupo para evitar duplicados
        $stmtDelete = $pdo->prepare("DELETE FROM asistencia WHERE id_grupo = :grupo AND fecha = :fecha");
        $stmtDelete->execute([':grupo' => $id_grupo, ':fecha' => $fecha_actual]);

        // Guardar cada alumno (1: Presente / 0: Ausente)
        $sqlInsert = "INSERT INTO asistencia (id_grupo, id_alumno, fecha, estado_asistencia) VALUES (:grupo, :alumno, :fecha, :estado)";
        $stmtInsert = $pdo->prepare($sqlInsert);

        foreach ($asistencias as $reg) {
            $valEstado = ($reg['estado'] === 'PRESENTE') ? 1 : 0;
            $stmtInsert->execute([
                ':grupo'  => $id_grupo,
                ':alumno' => intval($reg['id_alumno']),
                ':fecha'  => $fecha_actual,
                ':estado' => $valEstado
            ]);
        }

        $pdo->commit();

        echo json_encode([
            'status'  => 'success',
            'message' => '¡Asistencia guardada correctamente en la Base de Datos!'
        ]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error al guardar en BD: ' . $e->getMessage()]);
    }
    exit();
}
?>