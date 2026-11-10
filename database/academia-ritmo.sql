-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 06-11-2026 a las 14:07:23
-- Versión del servidor: 8.0.41
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `academia_ritmo`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumno`
--

CREATE TABLE `alumno` (
  `id_alumno` int NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `alumno`
--

INSERT INTO `alumno` (`id_alumno`, `nombre`, `apellidos`, `telefono`) VALUES
(1, 'Jovanny', 'Zamudio', '1234567891'),
(2, 'jeff', 'zeferino rodriguez', '123456789'),
(3, 'Jovanny', 'Zamudio', '1325146847'),
(4, 'Jovanny', 'Zamudio', '2135165'),
(5, 'luci', 'Zamudio', '16519849'),
(6, 'Jovanny', 'Zamudio', '62519598'),
(7, 'Jovanny', 'Zamudio', '54196549'),
(8, 'Jovanny', 'Zamudio', '1541651'),
(9, 'jeff', 'zeferino', '16565196'),
(10, 'Jovanny', 'Zamudio', '6265516');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencia`
--

CREATE TABLE `asistencia` (
  `id_asistencia` int NOT NULL,
  `id_alumno` int NOT NULL,
  `id_grupo` int NOT NULL,
  `fecha` date NOT NULL DEFAULT (curdate()),
  `estado_asistencia` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `asistencia`
--

INSERT INTO `asistencia` (`id_asistencia`, `id_alumno`, `id_grupo`, `fecha`, `estado_asistencia`) VALUES
(1, 10, 8, '2026-11-06', 1),
(2, 8, 9, '2026-11-06', 1),
(3, 9, 9, '2026-11-06', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grupo_taller`
--

CREATE TABLE `grupo_taller` (
  `id_grupo` int NOT NULL,
  `nombre_clase` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_clase` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cupo_maximo` int NOT NULL,
  `costo_cuota` decimal(10,2) NOT NULL,
  `id_instructor` int NOT NULL,
  `salon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Sala A',
  `horario` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '18:00 - 19:30'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `grupo_taller`
--

INSERT INTO `grupo_taller` (`id_grupo`, `nombre_clase`, `tipo_clase`, `cupo_maximo`, `costo_cuota`, `id_instructor`, `salon`, `horario`) VALUES
(2, 'salsa', 'Taller', 20, 250.00, 1, 'Sala A - Principal', '16:00 - 17:30'),
(3, 'bachata', 'Taller', 15, 150.00, 2, 'Sala B - Cristal', '17:30 - 19:00'),
(5, 'pop', 'Taller', 18, 150.00, 2, 'Sala C - Urbana', '19:00 - 20:30'),
(7, 'salsa avanzado', 'Taller', 26, 400.00, 1, 'Sala A - Principal', '20:30 - 22:00'),
(8, 'bachata intermedia', 'Taller', 1, 100.00, 1, 'Sala B - Cristal', '18:00 - 19:30'),
(9, 'quebradita', 'Taller', 2, 80.00, 2, 'Sala A', '18:00 - 19:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inscripcion`
--

CREATE TABLE `inscripcion` (
  `id_inscripcion` int NOT NULL,
  `id_alumno` int NOT NULL,
  `id_grupo` int NOT NULL,
  `fecha_registro` date NOT NULL DEFAULT (curdate()),
  `estado_inscripcion` enum('ACTIVA','CANCELADA','FINALIZADA') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVA'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `inscripcion`
--

INSERT INTO `inscripcion` (`id_inscripcion`, `id_alumno`, `id_grupo`, `fecha_registro`, `estado_inscripcion`) VALUES
(1, 1, 5, '2026-11-04', 'CANCELADA'),
(2, 2, 8, '2026-11-04', 'CANCELADA'),
(3, 3, 8, '2026-11-05', 'CANCELADA'),
(4, 4, 2, '2026-11-05', 'CANCELADA'),
(5, 5, 2, '2026-11-05', 'CANCELADA'),
(6, 6, 3, '2026-11-05', 'CANCELADA'),
(7, 7, 7, '2026-11-05', 'ACTIVA'),
(8, 8, 9, '2026-11-06', 'ACTIVA'),
(9, 9, 9, '2026-11-06', 'ACTIVA'),
(10, 10, 8, '2026-11-06', 'ACTIVA');

--
-- Disparadores `inscripcion`
--
DELIMITER $$
CREATE TRIGGER `tg_bloquear_sobrecupo` BEFORE INSERT ON `inscripcion` FOR EACH ROW BEGIN
    DECLARE v_cupo_max INT;
    DECLARE v_inscritos_activos INT;
    
    SELECT cupo_maximo INTO v_cupo_max FROM Grupo_Taller WHERE id_grupo = NEW.id_grupo;
    SELECT COUNT(*) INTO v_inscritos_activos FROM Inscripcion WHERE id_grupo = NEW.id_grupo AND estado_inscripcion = 'ACTIVA';
    
    IF (v_cupo_max - v_inscritos_activos) <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Capacidad máxima del grupo alcanzada (Sobrecupo).';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `instructor`
--

CREATE TABLE `instructor` (
  `id_instructor` int NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `especialidad` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `instructor`
--

INSERT INTO `instructor` (`id_instructor`, `nombre`, `apellidos`, `especialidad`) VALUES
(1, 'Gio', 'Instructor', 'Salsa y Bachata'),
(2, 'jeff', 'General', 'Baile General');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `log_acceso`
--

CREATE TABLE `log_acceso` (
  `id_log` int NOT NULL,
  `usuario` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_hora` datetime DEFAULT CURRENT_TIMESTAMP,
  `ip_dispositivo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('Exitoso','Fallido') COLLATE utf8mb4_unicode_ci DEFAULT 'Exitoso'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `log_acceso`
--

INSERT INTO `log_acceso` (`id_log`, `usuario`, `correo`, `rol`, `fecha_hora`, `ip_dispositivo`, `estado`) VALUES
(1, 'Jovanny Benítez Zamudio', 'benitezjovany200@gmail.com', 'RECEPCIONISTA', '2026-11-06 01:29:12', '127.0.0.1 (Escritorio)', 'Exitoso'),
(2, 'Jovanny Benítez Zamudio', 'benitezjovany200@gmail.com', 'RECEPCIONISTA', '2026-11-06 01:31:35', '127.0.0.1 (Escritorio)', 'Exitoso'),
(3, 'gio', 'instructor@ritmo.edu', 'INSTRUCTOR', '2026-11-06 01:32:10', '127.0.0.1 (Escritorio)', 'Exitoso'),
(4, 'Jeff Zeferino', 'admin@ritmo.edu', 'ADMIN', '2026-11-06 01:32:32', '127.0.0.1 (Escritorio)', 'Exitoso'),
(5, 'Jovanny Benítez Zamudio', 'benitezjovany200@gmail.com', 'RECEPCIONISTA', '2026-11-06 01:36:05', '127.0.0.1 (Móvil)', 'Exitoso');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago`
--

CREATE TABLE `pago` (
  `id_pago` int NOT NULL,
  `id_alumno` int NOT NULL,
  `id_grupo` int NOT NULL,
  `fecha_pago` date NOT NULL DEFAULT (curdate()),
  `monto` decimal(10,2) NOT NULL,
  `concepto` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `pago`
--

INSERT INTO `pago` (`id_pago`, `id_alumno`, `id_grupo`, `fecha_pago`, `monto`, `concepto`) VALUES
(1, 1, 5, '2026-11-04', 150.00, 'Inscripción inicial: pop'),
(2, 2, 8, '2026-11-04', 100.00, 'Inscripción inicial: bachata intermedia'),
(3, 5, 2, '2026-11-05', 250.00, 'Inscripción inicial: salsa'),
(4, 3, 8, '2026-11-05', 100.00, 'Liquidación de adeudo: bachata intermedia'),
(5, 9, 9, '2026-11-06', 80.00, 'Inscripción inicial: quebradita'),
(6, 10, 8, '2026-11-06', 100.00, 'Inscripción inicial: bachata intermedia');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL,
  `nombre_completo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('ADMIN','INSTRUCTOR','RECEPCIONISTA') COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nombre_completo`, `correo`, `password_hash`, `rol`, `fecha_registro`) VALUES
(1, 'Jeff Zeferino', 'admin@ritmo.edu', '$2y$10$ccoGQSRv0ec1aPMEO4wK3.MMGxpEiiaPLs928f5JrfdLJJloGkxQi', 'ADMIN', '2026-11-03 10:31:36'),
(2, 'Jovanny Benítez Zamudio', 'benitezjovany200@gmail.com', '$2y$10$ju9nvOnTrP495dQnbaZECeoT.99/mT1V2K.n70ywERmEZgz31qcDS', 'RECEPCIONISTA', '2026-11-04 08:24:22'),
(3, 'gio', 'instructor@ritmo.edu', '$2y$10$1TNrn5w.elsIV0gvdy6tluhV4o6zuzYxDZqNcKtG/L4X2YvFCrHYu', 'INSTRUCTOR', '2026-11-04 19:26:24'),
(4, 'jeff', 'instructor1@ritmo.edu', '$2y$10$VBcp8151gVe8a9jLUvrzkeVl9M8ZGg7m/3Cu0A636hUXB4yIIc1dq', 'INSTRUCTOR', '2026-11-04 19:56:03');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_estatus_pago_alumnos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_estatus_pago_alumnos` (
`id_grupo` int
,`id_alumno` int
,`nombre` varchar(50)
,`apellidos` varchar(50)
,`nombre_completo` varchar(101)
,`estado_pago` varchar(9)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_estatus_pago_alumnos`
--
DROP TABLE IF EXISTS `vw_estatus_pago_alumnos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_estatus_pago_alumnos`  AS SELECT `i`.`id_grupo` AS `id_grupo`, `a`.`id_alumno` AS `id_alumno`, `a`.`nombre` AS `nombre`, `a`.`apellidos` AS `apellidos`, concat(`a`.`nombre`,' ',`a`.`apellidos`) AS `nombre_completo`, (case when (ifnull(sum(`p`.`monto`),0) >= `g`.`costo_cuota`) then 'Solvente' else 'Pendiente' end) AS `estado_pago` FROM (((`alumno` `a` join `inscripcion` `i` on(((`a`.`id_alumno` = `i`.`id_alumno`) and (`i`.`estado_inscripcion` = 'ACTIVA')))) join `grupo_taller` `g` on((`i`.`id_grupo` = `g`.`id_grupo`))) left join `pago` `p` on(((`a`.`id_alumno` = `p`.`id_alumno`) and (`g`.`id_grupo` = `p`.`id_grupo`)))) GROUP BY `i`.`id_grupo`, `a`.`id_alumno`, `a`.`nombre`, `a`.`apellidos`, `g`.`costo_cuota` ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alumno`
--
ALTER TABLE `alumno`
  ADD PRIMARY KEY (`id_alumno`);

--
-- Indices de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD PRIMARY KEY (`id_asistencia`),
  ADD KEY `id_alumno` (`id_alumno`),
  ADD KEY `id_grupo` (`id_grupo`);

--
-- Indices de la tabla `grupo_taller`
--
ALTER TABLE `grupo_taller`
  ADD PRIMARY KEY (`id_grupo`),
  ADD KEY `id_instructor` (`id_instructor`);

--
-- Indices de la tabla `inscripcion`
--
ALTER TABLE `inscripcion`
  ADD PRIMARY KEY (`id_inscripcion`),
  ADD KEY `id_alumno` (`id_alumno`),
  ADD KEY `id_grupo` (`id_grupo`);

--
-- Indices de la tabla `instructor`
--
ALTER TABLE `instructor`
  ADD PRIMARY KEY (`id_instructor`);

--
-- Indices de la tabla `log_acceso`
--
ALTER TABLE `log_acceso`
  ADD PRIMARY KEY (`id_log`);

--
-- Indices de la tabla `pago`
--
ALTER TABLE `pago`
  ADD PRIMARY KEY (`id_pago`),
  ADD KEY `id_alumno` (`id_alumno`),
  ADD KEY `id_grupo` (`id_grupo`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alumno`
--
ALTER TABLE `alumno`
  MODIFY `id_alumno` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  MODIFY `id_asistencia` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `grupo_taller`
--
ALTER TABLE `grupo_taller`
  MODIFY `id_grupo` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `inscripcion`
--
ALTER TABLE `inscripcion`
  MODIFY `id_inscripcion` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `instructor`
--
ALTER TABLE `instructor`
  MODIFY `id_instructor` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `log_acceso`
--
ALTER TABLE `log_acceso`
  MODIFY `id_log` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `pago`
--
ALTER TABLE `pago`
  MODIFY `id_pago` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD CONSTRAINT `asistencia_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`),
  ADD CONSTRAINT `asistencia_ibfk_2` FOREIGN KEY (`id_grupo`) REFERENCES `grupo_taller` (`id_grupo`);

--
-- Filtros para la tabla `grupo_taller`
--
ALTER TABLE `grupo_taller`
  ADD CONSTRAINT `grupo_taller_ibfk_1` FOREIGN KEY (`id_instructor`) REFERENCES `instructor` (`id_instructor`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Filtros para la tabla `inscripcion`
--
ALTER TABLE `inscripcion`
  ADD CONSTRAINT `inscripcion_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`),
  ADD CONSTRAINT `inscripcion_ibfk_2` FOREIGN KEY (`id_grupo`) REFERENCES `grupo_taller` (`id_grupo`);

--
-- Filtros para la tabla `pago`
--
ALTER TABLE `pago`
  ADD CONSTRAINT `pago_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`),
  ADD CONSTRAINT `pago_ibfk_2` FOREIGN KEY (`id_grupo`) REFERENCES `grupo_taller` (`id_grupo`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
