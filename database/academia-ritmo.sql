-- Base de Datos Academia "Ritmo" (MySQL 8.0+)
CREATE DATABASE IF NOT EXISTS academia_ritmo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE academia_ritmo;

-- --------------------------------------------------------
-- Tabla de Usuarios (Autenticacion y Roles)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('ADMIN', 'INSTRUCTOR', 'RECEPCIONISTA') NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tablas Operativas del Sistema (3FN)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Instructor (
    id_instructor INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellidos VARCHAR(50) NOT NULL,
    especialidad VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Grupo_Taller (
    id_grupo INT AUTO_INCREMENT PRIMARY KEY,
    nombre_clase VARCHAR(50) NOT NULL,
    tipo_clase VARCHAR(30) NOT NULL,
    cupo_maximo INT NOT NULL,
    costo_cuota DECIMAL(10,2) NOT NULL,
    id_instructor INT NOT NULL,
    FOREIGN KEY (id_instructor) REFERENCES Instructor(id_instructor) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Alumno (
    id_alumno INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellidos VARCHAR(50) NOT NULL,
    telefono VARCHAR(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Inscripcion (
    id_inscripcion INT AUTO_INCREMENT PRIMARY KEY,
    id_alumno INT NOT NULL,
    id_grupo INT NOT NULL,
    fecha_registro DATE NOT NULL DEFAULT (CURRENT_DATE),
    estado_inscripcion ENUM('ACTIVA', 'CANCELADA', 'FINALIZADA') DEFAULT 'ACTIVA',
    FOREIGN KEY (id_alumno) REFERENCES Alumno(id_alumno),
    FOREIGN KEY (id_grupo) REFERENCES Grupo_Taller(id_grupo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Pago (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_alumno INT NOT NULL,
    id_grupo INT NOT NULL,
    fecha_pago DATE NOT NULL DEFAULT (CURRENT_DATE),
    monto DECIMAL(10,2) NOT NULL,
    concepto VARCHAR(100) NOT NULL,
    FOREIGN KEY (id_alumno) REFERENCES Alumno(id_alumno),
    FOREIGN KEY (id_grupo) REFERENCES Grupo_Taller(id_grupo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Asistencia (
    id_asistencia INT AUTO_INCREMENT PRIMARY KEY,
    id_alumno INT NOT NULL,
    id_grupo INT NOT NULL,
    fecha DATE NOT NULL DEFAULT (CURRENT_DATE),
    estado_asistencia TINYINT(1) NOT NULL,
    FOREIGN KEY (id_alumno) REFERENCES Alumno(id_alumno),
    FOREIGN KEY (id_grupo) REFERENCES Grupo_Taller(id_grupo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Trigger para Bloqueo por Sobrecupo
-- --------------------------------------------------------
DELIMITER //
CREATE TRIGGER tg_bloquear_sobrecupo
BEFORE INSERT ON Inscripcion
FOR EACH ROW
BEGIN
    DECLARE v_cupo_max INT;
    DECLARE v_inscritos_activos INT;
    
    SELECT cupo_maximo INTO v_cupo_max FROM Grupo_Taller WHERE id_grupo = NEW.id_grupo;
    SELECT COUNT(*) INTO v_inscritos_activos FROM Inscripcion WHERE id_grupo = NEW.id_grupo AND estado_inscripcion = 'ACTIVA';
    
    IF (v_cupo_max - v_inscritos_activos) <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Capacidad máxima del grupo alcanzada (Sobrecupo).';
    END IF;
END//
DELIMITER ;

-- --------------------------------------------------------
-- Usuarios Semilla para Pruebas (Password para todos: admin123)
-- --------------------------------------------------------
INSERT INTO Usuario (nombre_completo, correo, password_hash, rol) VALUES
('Administrador General', 'admin@ritmo.edu', '$2y$10$wN3t8s/9QfK./kH7W6l9oO/Jz5lH6/N0m2ZgB2K.cZ4f/Z4f/Z4f.', 'ADMIN')
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash);