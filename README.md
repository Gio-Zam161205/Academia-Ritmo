# Sistema de Gestión Web – Academia de Baile "Ritmo"

![Estado del Proyecto](https://img.shields.io/badge/Estado-U3--E1%20Desarrollo%20Base-success)
![PHP Version](https://img.shields.io/badge/PHP-8.1%2B-blue)
![MySQL Version](https://img.shields.io/badge/MySQL-8.0%2B-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.0-38bdf8)

---

## 📌 1. Objetivo del Sistema
El sistema de la **Academia de Baile "Ritmo"** es una plataforma web responsiva unificada (PWA) diseñada para conectar la caja de recepción con los salones de baile en tiempo real. Atiende dos problemáticas críticas detectadas durante la fase de análisis operativo[cite: 5]:

1. **Frenar la fuga de capital:** Permite al instructor validar discretamente la solvencia financiera del alumno (*Solvente / Pendiente*) al pasar lista desde su smartphone, omitiendo cifras de dinero para proteger la privacidad del estudiante.
2. **Control de Aforo y Sobrecupo:** Permite a la recepcionista consultar la disponibilidad física de los salones en tiempo real e impide automáticamente nuevas inscripciones cuando el cupo máximo de una clase o taller llega a cero.

---

## 👥 2. Actores y Roles Operativos
- **Instructor de Baile:** Accede desde navegadores móviles en su propio smartphone (*BYOD*) para tomar lista en menos de 2 minutos, visualizar el estatus de pago del alumno y sincronizar automáticamente con recepción al cerrar la sesión.
- **Recepcionista:** Opera desde la PC de escritorio en la caja de recepción para registrar inscripciones, cobrar mensualidades, registrar nuevos talleres y consultar los aforos disponibles por grupo en tiempo real.

---

## 🛠️ 3. Stack Tecnológico
- **Frontend:** HTML5, CSS3 (Tailwind CSS via CDN / Hojas de estilo neón unificadas) y JavaScript ES6+ (interfaz táctil y responsiva)[cite: 6].
- **Backend:** PHP 8.1+ utilizando **PDO (PHP Data Objects)** con consultas preparadas para prevenir inyecciones SQL.
- **Base de Datos:** MySQL 8.0+ (Motor InnoDB en 3FN) con soporte para disparadores (*Triggers*) de control de aforo[cite: 1, 8].
- **Servidor Local / Entorno:** XAMPP / Laragon (Servidor Apache) y Visual Studio Code.
- **Control de Versiones:** Git y GitHub Desktop[cite: 1, 8].

---

## 📂 4. Estructura del Repositorio
```text
Academia_Ritmo/
├── config/
│   └── db.php                     # Configuración centralizada de conexión PDO a MySQL
├── css/
│   ├── admin-styles.css           # Estilos para panel administrativo
│   ├── log.css                    # Estilos visuales neón para vistas de autenticación
│   └── styleR.css                 # Estilos específicos de la vista de Recepción / Aforos
├── database/
│   └── schema.sql                 # Script DDL en 3FN, Triggers de sobrecupo y Usuarios Semilla
├── js/
│   ├── log.js                     # Lógica de autenticación asíncrona (login.php)
│   ├── mainR.js                   # Lógica de Recepción (CU-02), renderizado de aforos e inscripciones
│   └── register.js                # Validación de formulario y registro de usuarios
├── php/
│   ├── inscribir_alumno.php       # Backend para procesar inscripciones y validar aforos
│   ├── login.php                  # Backend de autenticación, hash Bcrypt y ruteo por roles
│   ├── logout.php                 # Cierre seguro de sesión de usuario
│   ├── obtener_aforos.php         # Consulta dinámicamente el aforo consumido por taller
│   ├── obtener_y_crear_grupos.php # Endpoint GET/POST para consultar y registrar grupos/alumnos
│   └── register.php               # Backend de inserción de usuarios con encriptación Bcrypt
├── public/
│   └── conexion.php               # Endpoint de prueba de conexión App-BD para la evidencia E1
├── index.html                     # Panel Principal de Recepción / Control de Aforos (CU-02)
├── log.html                       # Pantalla de Inicio de Sesión
├── register.html                  # Pantalla de Registro de Usuarios
└── README.md                      # Documentación oficial del repositorio