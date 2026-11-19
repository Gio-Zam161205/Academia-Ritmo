<?php
// php/inscribir_alumno.php - Procesamiento de Inscripciones y Aforos (CU-02)
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido.']);
    exit();
}

$nombre         = trim($_POST['nombre'] ?? '');
$apellidos      = trim($_POST['apellidos'] ?? '');
$telefono       = trim($_POST['telefono'] ?? '');
$id_grupo       = intval($_POST['id_grupo'] ?? 0);
$registrar_pago = ($_POST['registrar_pago'] ?? '0') === '1';

// 2. Validar campos obligatorios
if ($nombre === '' || $apellidos === '' || $id_grupo <= 0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Faltan datos obligatorios para el registro.']);
    exit();
}

// 3. Lista Blanca: Solo permitir letras, acentos, espacios, puntos y guiones (Bloquea XSS y símbolos)
$nombre    = preg_replace('/\s+/', ' ', $nombre);
$apellidos = preg_replace('/\s+/', ' ', $apellidos);
$regexNombre = '/^[a-zA-ZÁÉÍÓÚÜáéíóúüÑñ\s\.\'-]{2,50}$/u';

if (!preg_match($regexNombre, $nombre) || !preg_match($regexNombre, $apellidos)) {
    http_response_code(400);
    echo json_encode([
        'status'  => 'error',
        'message' => 'El nombre y apellidos del alumno solo pueden contener letras y espacios (sin símbolos ni etiquetas).'
    ]);
    exit();
}

// 4. Validar teléfono opcional (solo números, +, -, paréntesis y espacios)
if ($telefono !== '' && !preg_match('/^[0-9\+\-\s\(\)]{7,20}$/', $telefono)) {
    http_response_code(400);
    echo json_encode([
        'status'  => 'error',
        'message' => 'El formato del teléfono no es válido (ingresa solo dígitos).'
    ]);
    exit();
}

try {
    $pdo->beginTransaction();

    // 5. Insertar el alumno en la tabla alumno
    $stmtAlumno = $pdo->prepare("INSERT INTO alumno (nombre, apellidos, telefono) VALUES (:nombre, :apellidos, :telefono)");
    $stmtAlumno->execute([
        ':nombre'    => $nombre,
        ':apellidos' => $apellidos,
        ':telefono'  => $telefono
    ]);
    $id_alumno = $pdo->lastInsertId();

    // 6. Insertar inscripción (Aquí actúa automáticamente el Trigger tg_bloquear_sobrecupo si está lleno)
    $stmtInsc = $pdo->prepare("INSERT INTO inscripcion (id_alumno, id_grupo, fecha_registro, estado_inscripcion) VALUES (:id_alumno, :id_grupo, CURRENT_DATE(), 'ACTIVA')");
    $stmtInsc->execute([
        ':id_alumno' => $id_alumno,
        ':id_grupo'  => $id_grupo
    ]);

    // 7. Registrar pago inicial si se seleccionó la opción
    if ($registrar_pago) {
        $stmtCosto = $pdo->prepare("SELECT costo_cuota, nombre_clase FROM grupo_taller WHERE id_grupo = :id_grupo LIMIT 1");
        $stmtCosto->execute([':id_grupo' => $id_grupo]);
        $grupo = $stmtCosto->fetch(PDO::FETCH_ASSOC);

        if ($grupo) {
            $concepto = mb_substr('Cuota inicial: ' . $grupo['nombre_clase'], 0, 100);
            $stmtPago = $pdo->prepare("INSERT INTO pago (id_alumno, id_grupo, fecha_pago, monto, concepto) VALUES (:id_alumno, :id_grupo, CURRENT_DATE(), :monto, :concepto)");
            $stmtPago->execute([
                ':id_alumno' => $id_alumno,
                ':id_grupo'  => $id_grupo,
                ':monto'     => $grupo['costo_cuota'],
                ':concepto'  => $concepto
            ]);
        }
    }

    $pdo->commit();
    echo json_encode([
        'status'  => 'success',
        'message' => "¡Alumno {$nombre} {$apellidos} inscrito y registrado correctamente!"
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    $msg = $e->getMessage();
    http_response_code(400);
    if (stripos($msg, 'Sobrecupo') !== false || stripos($msg, 'capacidad máxima') !== false) {
        echo json_encode(['status' => 'error', 'message' => 'Bloqueo de sobrecupo: El taller ha alcanzado su capacidad máxima.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No se pudo completar la inscripción en la base de datos.']);
    }
}
exit();