# Sistema de Gestión Web – Academia de Baile "Ritmo"

![Estado del Proyecto](https://img.shields.io/badge/Estado-U3--E1%20Desarrollo%20Base-success)
![PHP Version](https://img.shields.io/badge/PHP-8.1%2B-blue)
![MySQL Version](https://img.shields.io/badge/MySQL-8.0%2B-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.0-38bdf8)

---

<<<<<<< HEAD
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
=======
<<<<<<< HEAD


## 📌 1. Objetivo del Sistema
El sistema de la **Academia de Baile "Ritmo"** es una plataforma web responsiva unificada (PWA) diseñada para conectar la caja de recepción con los salones de baile en tiempo real. Atiende dos problemáticas críticas detectadas durante la fase de análisis operativo[cite: 5]:
=======
📌 1. Objetivo del SistemaLa plataforma web responsiva unificada de la Academia de Baile "Ritmo" conecta la caja de recepción con los salones de clase en tiempo real para resolver dos problemáticas operativas críticas:Frenar la fuga de capital: Permite al instructor validar discretamente la solvencia financiera del alumno (Solvente / Pendiente) al pasar lista desde su smartphone, protegiendo la privacidad al omitir cifras de dinero.Control de aforo en tiempo real: Permite a la recepcionista consultar la disponibilidad física de los salones e impide automáticamente nuevas inscripciones cuando el cupo máximo llega a cero mediante un disparador lógico (Trigger) en la base de datos.
>>>>>>> 2808bbc7bb3dcadca25d9e952f46bc199d461ff7

👥 2. Actores y Roles OperativosInstructor de Baile: Accede desde navegadores móviles en su smartphone (BYOD) para tomar lista en menos de 2 minutos, verificar el estatus de pago y sincronizar automáticamente con la administración al cerrar sesión.Recepcionista: Opera desde la PC de escritorio en la caja para procesar altas con datos completos, cobrar mensualidades, registrar nuevos talleres y consultar los aforos disponibles por grupo.🛠️ 3. Stack TecnológicoFrontend: HTML5, CSS3 (Hojas de estilo neón/glassmorphism unificadas) y JavaScript ES6+ (Fetch API asíncrona).Backend: PHP 8.1+ utilizando PDO (PHP Data Objects) con consultas preparadas contra inyecciones SQL.Base de Datos: MySQL 8.0+ (Motor InnoDB, normalizado en Tercera Forma Normal - 3FN) con soporte para Triggers de control de sobrecupo.Servidor Local: Apache (XAMPP o Laragon) y Visual Studio Code.

📂 4. Estructura del RepositorioAcademia_Ritmo/
├── config/
│   └── db.php                     # Conexión centralizada PDO a MySQL
├── css/
│   ├── log.css                    # Estilos neón para vistas de autenticación
│   ├── register.css               # Estilos exclusivos para registro
│   └── styleR.css                 # Estilos específicos del panel de recepción y aforos
├── database/
│   └── schema.sql                 # Script DDL en 3FN, Trigger de sobrecupo y datos semilla
├── js/
│   ├── log.js                     # Lógica asíncrona de inicio de sesión
│   ├── mainR.js                   # Lógica de recepción (CU-02), aforos, filtros y renderizado
│   └── register.js                # Validación de formulario y registro de usuarios
├── php/
│   ├── inscribir_alumno.php       # Backend para procesar altas y validar aforos en BD
│   ├── liberar_cupo.php           # Backend para listar e inactivar inscripciones activas
│   ├── login.php                  # Backend de autenticación, hash Bcrypt y sesiones
│   ├── logout.php                 # Cierre seguro de sesión de usuario
│   ├── obtener_aforos.php         # Consulta dinámica del aforo consumido por taller
│   ├── obtener_pendientes.php     # Consulta alumnos con adeudos pendientes
│   ├── obtener_y_crear_grupos.php # Endpoint GET/POST para consultar y registrar grupos/instructores
│   └── register.php               # Backend de inserción de usuarios con encriptación Bcrypt
├── index.html                     # Panel Principal de Recepción y Control de Aforos (CU-02)
├── log.html                       # Pantalla de Inicio de Sesión
├── register.html                  # Pantalla de Registro de Usuarios
└── README.md                      # Documentación oficial del repositorio


🛡️ Regla de Negocio Automatizada: Trigger de SobrecupoEl bloqueo físico frente al sobrecupo está implementado mediante un disparador de base de datos tipo

 BEFORE INSERT:DELIMITER //
CREATE TRIGGER tg_bloquear_sobrecupo
BEFORE INSERT ON inscripcion
FOR EACH ROW
BEGIN
    DECLARE v_cupo_max INT;
    DECLARE v_inscritos_activos INT;
    
    IF NEW.estado_inscripcion = 'ACTIVA' THEN
        SELECT cupo_maximo INTO v_cupo_max FROM grupo_taller WHERE id_grupo = NEW.id_grupo;
        SELECT COUNT(*) INTO v_inscritos_activos FROM inscripcion WHERE id_grupo = NEW.id_grupo AND estado_inscripcion = 'ACTIVA';
        
        IF v_inscritos_activos >= v_cupo_max THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Capacidad máxima del grupo alcanzada (Sobrecupo).';
        END IF;
    END IF;
END//
DELIMITER ;

🚀 6. Guía de Instalación y Ejecución Local (Paso a Paso)Para poner en marcha el sistema en tu entorno de desarrollo local, sigue rigurosamente estos pasos:Requisitos previos: Tener instalado XAMPP o Laragon con PHP 8.1+ y MySQL 8.0+.Ubicación: Clona este repositorio dentro de la carpeta raíz de tu servidor Apache (C:/xampp/htdocs/Academia_Ritmo/ o C:/laragon/www/Academia_Ritmo/).Base de Datos:Inicia los servicios de Apache y MySQL.Entra a phpMyAdmin (http://localhost/phpmyadmin/) y crea una base de datos llamada academia_ritmo (utf8mb4_unicode_ci).Importa el archivo ubicado en database/schema.sql.Verificar Conexión: Revisa que el archivo config/db.php apunte correctamente a tu servidor local (root sin contraseña por defecto).Ejecución: Abre tu navegador institucional mediante la URL del servidor local:Inicio de Sesión: http://localhost/Academia_Ritmo/log.htmlPanel de Recepción: http://localhost/Academia_Ritmo/index.html
>>>>>>> ea5cd51dde0c32d7e7098f31b7880451a8c3ef9d
