# Sistema de Gestión - Academia de Baile "Ritmo"

## Objetivo
Plataforma web responsiva para conectar la recepción con los salones de baile en tiempo real. Permite validar la solvencia financiera de los alumnos de manera discreta durante el pase de lista y controlar el aforo máximo de los talleres para evitar sobrecupos.

## Objetivo del Sistema
El sistema de la **Academia de Baile "Ritmo"** es una plataforma web responsiva unificada (PWA) diseñada para conectar la caja de recepción con los salones de baile en tiempo real[cite: 1, 10, 15]. Atiende dos problemáticas críticas detectadas durante la fase de análisis:

1. **Frenar la fuga de capital:** Permite al instructor validar discretamente la solvencia financiera del alumno (*Solvente / Pendiente*) al pasar lista desde su smartphone, omitiendo cifras de dinero para proteger la privacidad del estudiante[cite: 10, 14, 15].
2. **Control de Aforo y Sobrecupo:** Permite a la recepcionista consultar la disponibilidad física de los salones en tiempo real e impide automáticamente nuevas inscripciones cuando el cupo máximo de una clase llega a cero[cite: 14, 15].

---

## Actores y Roles
- **Instructor de Baile:** Accede desde navegadores móviles en su propio smartphone (*BYOD*) para tomar lista en menos de 2 minutos y sincronizar automáticamente con recepción[cite: 10, 14, 15].
- **Recepcionista:** Opera desde la PC de escritorio en la caja de recepción para registrar inscripciones, cobrar mensualidades y consultar aforos en tiempo real[cite: 10, 14, 15].

## Tecnologías Utilizadas
- **Frontend:** HTML5, CSS3, JavaScript (Tailwind CSS)
- **Backend:** PHP 8.1+ (PDO)
- **Base de Datos:** MySQL 8.0+
- **Servidor Local:** Apache (XAMPP / Laragon)

## Estructura del Proyecto
- `/config`: Archivos de conexión a la Base de Datos.
- `/public`: Vistas web y scripts de comprobación de la API.
- `/database`: Scripts SQL DDL de creación de tablas, triggers y datos de prueba.