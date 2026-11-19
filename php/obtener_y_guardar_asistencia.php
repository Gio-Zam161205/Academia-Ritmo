<?php
// php/obtener_y_guardar_asistencia.php
ob_start();
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
session_start();
require_once '../config/db.php'; // Conexión PDO centralizada

if (ob_get_length()) {
    ob_clean();
}

// 1. Verificar sesión activa
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Sesión no iniciada o expirada.']);
    exit();
}

// 2. Verificar rol permitido (INSTRUCTOR o ADMIN)
$rolSesion = strtoupper(trim($_SESSION['rol'] ?? ''));
if (!in_array($rolSesion, ['INSTRUCTOR', 'ADMIN'], true)) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Acceso denegado: Se requiere perfil de Instructor.']);
    exit();
}

// 3. Obtener el nombre real del usuario desde la BD usando $_SESSION['user_id']
$id_usuario = intval($_SESSION['user_id']);
$stmtUser = $pdo->prepare("SELECT nombre_completo FROM usuario WHERE id_usuario = :uid LIMIT 1");
$stmtUser->execute([':uid' => $id_usuario]);
$rowUser = $stmtUser->fetch(PDO::FETCH_ASSOC);

$nombreUsuario = trim($rowUser['nombre_completo'] ?? $_SESSION['nombre'] ?? 'Instructor');

// 4. Buscar el id_instructor exacto que le corresponde a este usuario
$id_instructor = 0;
if ($nombreUsuario !== '') {
    $partes       = preg_split('/\s+/', $nombreUsuario, -1, PREG_SPLIT_NO_EMPTY);
    $primerNombre = $partes[0] ?? $nombreUsuario;

    $stmtInst = $pdo->prepare("
        SELECT id_instructor 
        FROM instructor 
        WHERE LOWER(TRIM(CONCAT(nombre, ' ', apellidos))) = LOWER(TRIM(:completo))
           OR LOWER(TRIM(nombre)) = LOWER(TRIM(:primer))
           OR LOWER(TRIM(CONCAT(nombre, ' ', apellidos))) LIKE LOWER(:likePrimer)
        ORDER BY id_instructor ASC
        LIMIT 1
    ");
    $stmtInst->execute([
        ':completo'   => $nombreUsuario,
        ':primer'     => $primerNombre,
        ':likePrimer' => '%' . $primerNombre . '%'
    ]);
    $rowInst = $stmtInst->fetch(PDO::FETCH_ASSOC);
    $id_instructor = intval($rowInst['id_instructor'] ?? 0);
}

// Generar iniciales para el avatar de la barra superior
$partesAvatar = preg_split('/\s+/', $nombreUsuario, -1, PREG_SPLIT_NO_EMPTY);
$iniciales    = '';
foreach (array_slice($partesAvatar, 0, 2) as $p) {
    $iniciales .= mb_strtoupper(mb_substr($p, 0, 1));
}
if ($iniciales === '') {
    $iniciales = 'IN';
}

$method = $_SERVER['REQUEST_METHOD'];

// ==========================================================================
// A. OBTENER ÚNICAMENTE LOS GRUPOS ASIGNADOS AL INSTRUCTOR Y SU NÓMINA (GET)
// ==========================================================================
if ($method === 'GET') {
    try {
        if ($rolSesion === 'ADMIN') {
            $sqlGrupos = "
                SELECT 
                    g.id_grupo,
                    g.nombre_clase,
                    g.tipo_clase AS salon,
                    CONCAT('Cupo: ', g.cupo_maximo) AS horario,
                    (SELECT COUNT(*) FROM asistencia ast WHERE ast.id_grupo = g.id_grupo AND ast.fecha = CURRENT_DATE()) > 0 AS ya_paso_lista
                FROM grupo_taller g
                ORDER BY g.id_grupo ASC
            ";
            $stmtG = $pdo->query($sqlGrupos);
        } else {
            // Filtrar EXCLUSIVAMENTE por el id_instructor autenticado
            $sqlGrupos = "
                SELECT 
                    g.id_grupo,
                    g.nombre_clase,
                    g.tipo_clase AS salon,
                    CONCAT('Cupo: ', g.cupo_maximo) AS horario,
                    (SELECT COUNT(*) FROM asistencia ast WHERE ast.id_grupo = g.id_grupo AND ast.fecha = CURRENT_DATE()) > 0 AS ya_paso_lista
                FROM grupo_taller g
                WHERE g.id_instructor = :inst
                ORDER BY g.id_grupo ASC
            ";
            $stmtG = $pdo->prepare($sqlGrupos);
            $stmtG->execute([':inst' => $id_instructor]);
        }

        $grupos = $stmtG->fetchAll(PDO::FETCH_ASSOC);

        foreach ($grupos as &$g) {
            $g['ya_paso_lista'] = (bool)$g['ya_paso_lista'];
        }
        unset($g);

        $id_grupo_sel     = intval($_GET['id_grupo'] ?? ($grupos[0]['id_grupo'] ?? 0));
        $alumnos          = [];
        $yaPasoListaGrupo = false;

        if ($id_grupo_sel > 0) {
            // Verificar que el grupo solicitado pertenezca realmente a este instructor
            $grupoValido = false;
            foreach ($grupos as $gr) {
                if (intval($gr['id_grupo']) === $id_grupo_sel) {
                    $grupoValido      = true;
                    $yaPasoListaGrupo = (bool)$gr['ya_paso_lista'];
                    break;
                }
            }

            if (!$grupoValido) {
                http_response_code(403);
                echo json_encode(['status' => 'error', 'message' => 'No tienes permiso para consultar este grupo.']);
                exit();
            }

            // Consultar alumnos inscritos activos, su solvencia y su asistencia de hoy (si ya se tomó)
            $sqlAlumnos = "
                SELECT 
                    a.id_alumno,
                    CONCAT(a.nombre, ' ', a.apellidos) AS nombre_completo,
                    CASE 
                        WHEN IFNULL(SUM(p.monto), 0) >= g.costo_cuota THEN 'Solvente'
                        ELSE 'Pendiente'
                    END AS estado_pago,
                    (
                        SELECT CASE WHEN ast.estado_asistencia = 1 THEN 'PRESENTE' ELSE 'AUSENTE' END
                        FROM asistencia ast
                        WHERE ast.id_grupo = g.id_grupo 
                          AND ast.id_alumno = a.id_alumno 
                          AND ast.fecha = CURRENT_DATE()
                        ORDER BY ast.id_asistencia DESC
                        LIMIT 1
                    ) AS estado_hoy
                FROM alumno a
                INNER JOIN inscripcion i ON a.id_alumno = i.id_alumno AND UPPER(i.estado_inscripcion) = 'ACTIVA'
                INNER JOIN grupo_taller g ON i.id_grupo = g.id_grupo
                LEFT JOIN pago p ON a.id_alumno = p.id_alumno AND g.id_grupo = p.id_grupo
                WHERE i.id_grupo = :grupo
                GROUP BY a.id_alumno, a.nombre, a.apellidos, g.id_grupo, g.costo_cuota
                ORDER BY a.apellidos ASC, a.nombre ASC
            ";
            $stmtA = $pdo->prepare($sqlAlumnos);
            $stmtA->execute([':grupo' => $id_grupo_sel]);
            $alumnos = $stmtA->fetchAll(PDO::FETCH_ASSOC);
        }

        echo json_encode([
            'status'        => 'success',
            'usuario'       => [
                'nombre'    => $nombreUsuario,
                'iniciales' => $iniciales,
                'rol'       => $rolSesion === 'ADMIN' ? 'Administrador' : 'Docente Instructor'
            ],
            'grupos'        => $grupos,
            'id_grupo'      => $id_grupo_sel,
            'ya_paso_lista' => $yaPasoListaGrupo,
            'alumnos'       => $alumnos
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error interno al consultar las listas de asistencia.']);
    }
    exit();
}

// ==========================================================================
// B. GUARDAR ASISTENCIAS CON BLOQUEO ESTRICTO SI YA SE PASÓ LISTA HOY (POST)
// ==========================================================================
if ($method === 'POST') {
    $inputRaw = file_get_contents('php://input');
    $data     = json_decode($inputRaw, true);

    $id_grupo    = intval($data['id_grupo'] ?? 0);
    $asistencias = $data['asistencias'] ?? [];

    if ($id_grupo <= 0 || !is_array($asistencias) || empty($asistencias)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Datos incompletos para registrar la asistencia.']);
        exit();
    }

    try {
        // 1. Verificar propiedad estricta del grupo
        if ($rolSesion !== 'ADMIN') {
            $stmtPermiso = $pdo->prepare("SELECT id_grupo FROM grupo_taller WHERE id_grupo = :grupo AND id_instructor = :inst LIMIT 1");
            $stmtPermiso->execute([':grupo' => $id_grupo, ':inst' => $id_instructor]);
            if (!$stmtPermiso->fetch()) {
                http_response_code(403);
                echo json_encode(['status' => 'error', 'message' => 'No tienes permiso para registrar asistencia en este grupo.']);
                exit();
            }
        }

        $pdo->beginTransaction();

        // 2. Candado estricto: impedir volver a pasar lista si ya existe registro hoy
        $stmtYaPaso = $pdo->prepare("SELECT COUNT(*) FROM asistencia WHERE id_grupo = :grupo AND fecha = CURRENT_DATE()");
        $stmtYaPaso->execute([':grupo' => $id_grupo]);
        if (intval($stmtYaPaso->fetchColumn()) > 0) {
            $pdo->rollBack();
            http_response_code(400);
            echo json_encode([
                'status'  => 'error',
                'message' => 'Bloqueo activo: La asistencia de este grupo ya fue registrada el día de hoy.'
            ]);
            exit();
        }

        // 3. Validar que cada alumno pertenezca activamente al grupo e insertar
        $stmtValidarAlumno = $pdo->prepare("
            SELECT 1 FROM inscripcion 
            WHERE id_grupo = :grupo AND id_alumno = :alumno AND UPPER(estado_inscripcion) = 'ACTIVA' 
            LIMIT 1
        ");
        $stmtInsert = $pdo->prepare("
            INSERT INTO asistencia (id_alumno, id_grupo, fecha, estado_asistencia) 
            VALUES (:alumno, :grupo, CURRENT_DATE(), :estado)
        ");

        $procesados = 0;
        foreach ($asistencias as $reg) {
            $id_alumno = intval($reg['id_alumno'] ?? 0);
            $estadoStr = strtoupper(trim($reg['estado'] ?? ''));

            if ($id_alumno <= 0 || !in_array($estadoStr, ['PRESENTE', 'AUSENTE'], true)) {
                continue;
            }

            $stmtValidarAlumno->execute([':grupo' => $id_grupo, ':alumno' => $id_alumno]);
            if (!$stmtValidarAlumno->fetch()) {
                continue;
            }

            $stmtInsert->execute([
                ':alumno' => $id_alumno,
                ':grupo'  => $id_grupo,
                ':estado' => ($estadoStr === 'PRESENTE') ? 1 : 0
            ]);
            $procesados++;
        }

        if ($procesados === 0) {
            $pdo->rollBack();
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'No se encontraron alumnos válidos para guardar.']);
            exit();
        }

        $pdo->commit();

        echo json_encode([
            'status'  => 'success',
            'message' => "¡Asistencia de {$procesados} alumnos sincronizada y cerrada por hoy!"
        ]);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error interno al guardar la asistencia en la base de datos.']);
    }
    exit();
}

http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Método HTTP no permitido.']);
exit();