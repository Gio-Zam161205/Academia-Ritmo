<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre         = trim($_POST['nombre'] ?? '');
    $apellidos      = trim($_POST['apellidos'] ?? '');
    $telefono       = trim($_POST['telefono'] ?? '');
    $id_grupo       = intval($_POST['id_grupo'] ?? 0);
    $registrar_pago = isset($_POST['registrar_pago']) && $_POST['registrar_pago'] === '1';

    if (empty($nombre) || empty($apellidos) || $id_grupo <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Ingresa el nombre, apellidos y selecciona un taller.']);
        exit();
    }

    try {
        $pdo->beginTransaction();

        // 1. Insertar el Alumno en la BD
        $stmtAlumno = $pdo->prepare("INSERT INTO Alumno (nombre, apellidos, telefono) VALUES (?, ?, ?)");
        $stmtAlumno->execute([$nombre, $apellidos, $telefono]);
        $id_alumno = $pdo->lastInsertId();

        // 2. Insertar Inscripción (Activa el Trigger tg_bloquear_sobrecupo)
        $stmtInsc = $pdo->prepare("INSERT INTO Inscripcion (id_alumno, id_grupo, fecha_registro, estado_inscripcion) VALUES (?, ?, CURRENT_DATE(), 'ACTIVA')");
        $stmtInsc->execute([$id_alumno, $id_grupo]);

        // 3. Registrar el Pago en la BD si se seleccionó la casilla
        if ($registrar_pago) {
            $stmtGrupo = $pdo->prepare("SELECT costo_cuota, nombre_clase FROM Grupo_Taller WHERE id_grupo = ?");
            $stmtGrupo->execute([$id_grupo]);
            $grupoData = $stmtGrupo->fetch(PDO::FETCH_ASSOC);

            if ($grupoData) {
                $monto = $grupoData['costo_cuota'];
                $concepto = "Inscripción inicial: " . $grupoData['nombre_clase'];

                $stmtPago = $pdo->prepare("INSERT INTO Pago (id_alumno, id_grupo, fecha_pago, monto, concepto) VALUES (?, ?, CURRENT_DATE(), ?, ?)");
                $stmtPago->execute([$id_alumno, $id_grupo, $monto, $concepto]);
            }
        }

        $pdo->commit();

        echo json_encode([
            'status' => 'success',
            'message' => '¡Alumno ' . $nombre . ' registrado e inscrito exitosamente!'
        ]);

    } catch (PDOException $e) {
        $pdo->rollBack();
        
        $mensaje = $e->getMessage();
        if (strpos($mensaje, 'Sobrecupo') !== false) {
            $mensaje = 'Error: Capacidad máxima del grupo alcanzada (Sobrecupo).';
        }

        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => $mensaje]);
    }
    exit();
}
?>