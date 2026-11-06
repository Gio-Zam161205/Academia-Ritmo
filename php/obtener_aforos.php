<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php'; // Conexión PDO centralizada[cite: 4]

try {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
    $sql = "SELECT 
                g.id_grupo, 
                g.nombre_clase, 
                g.tipo_clase, 
                g.cupo_maximo, 
                g.costo_cuota,
                CONCAT(IFNULL(i.nombre, 'Sin'), ' ', IFNULL(i.apellidos, 'Asignar')) AS nombre_instructor,
                COUNT(ins.id_inscripcion) AS ocupacion_actual,
                (g.cupo_maximo - COUNT(ins.id_inscripcion)) AS cupo_disponible
            FROM grupo_taller g
            LEFT JOIN instructor i ON g.id_instructor = i.id_instructor
            LEFT JOIN inscripcion ins ON g.id_grupo = ins.id_grupo AND UPPER(ins.estado_inscripcion) = 'ACTIVA'
            GROUP BY g.id_grupo, g.nombre_clase, g.tipo_clase, g.cupo_maximo, g.costo_cuota, i.nombre, i.apellidos";
<<<<<<< HEAD
=======
=======
    $sql = "SELECT g.id_grupo, g.nombre_clase, g.cupo_maximo, g.costo_cuota,
                   CONCAT(i.nombre, ' ', i.apellidos) AS nombre_instructor,
                   (g.cupo_maximo - COUNT(ins.id_inscripcion)) AS cupo_disponible,
                   COUNT(ins.id_inscripcion) AS ocupacion_actual
            FROM grupo_taller g
            LEFT JOIN instructor i ON g.id_instructor = i.id_instructor
            LEFT JOIN inscripcion ins ON g.id_grupo = ins.id_grupo AND ins.estado_inscripcion = 'ACTIVA'
            GROUP BY g.id_grupo, g.nombre_clase, g.cupo_maximo, g.costo_cuota, i.nombre, i.apellidos";
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d

    $stmt = $pdo->query($sql);
    $grupos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'data'   => $grupos
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Error al consultar aforos: ' . $e->getMessage()
    ]);
}
<<<<<<< HEAD
exit();
?>
=======
<<<<<<< HEAD
exit();
?>
=======
exit();
>>>>>>> d2a2b8e451c4f42fd184ebeabe6dbb4f0445b03d
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
