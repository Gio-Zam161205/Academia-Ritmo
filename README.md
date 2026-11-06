# Sistema de Gestión Web – Academia de Baile "Ritmo"

![Estado del Proyecto](https://img.shields.io/badge/Estado-U3--E1%20Desarrollo%20Base-success)
![PHP Version](https://img.shields.io/badge/PHP-8.1%2B-blue)
![MySQL Version](https://img.shields.io/badge/MySQL-8.0%2B-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.0-38bdf8)

---

## 📌 1. Objetivo del Sistema
El sistema de la **Academia de Baile "Ritmo"** es una plataforma web responsiva unificada diseñada para conectar la caja de recepción con los salones de baile en tiempo real. Atiende dos problemáticas críticas operativas[cite: 5]:
1. **Frenar la fuga de capital:** Permite al instructor validar discretamente la solvencia financiera del alumno (*Solvente / Pendiente*) al pasar lista desde su smartphone, protegiendo la privacidad de los datos financieros.
2. **Control de Aforo y Sobrecupo:** Permite a la recepcionista consultar la disponibilidad física de los salones en tiempo real e impide automáticamente nuevas inscripciones cuando el cupo máximo de una clase o taller llega a cero mediante reglas activas (*Triggers*).

---

## 👥 2. Actores y Roles Operativos
- **Instructor de Baile:** Accede desde navegadores móviles en su propio smartphone (*BYOD*) para tomar asistencia en menos de 2 minutos, visualizar el estatus de pago del alumno y sincronizar de forma automática con recepción.
- **Recepcionista:** Opera desde la PC de escritorio en la caja de recepción para registrar inscripciones, cobrar mensualidades, dar de alta nuevos talleres y consultar los aforos disponibles por grupo en tiempo real.

---

## 🛠️ 3. Stack Tecnológico
- **Frontend:** HTML5, CSS3 (Tailwind CSS via CDN / Hojas de estilo unificadas neón) y JavaScript ES6+ (interfaz táctil y asíncrona)[cite: 6].
- **Backend:** PHP 8.1+ utilizando **PDO (PHP Data Objects)** con consultas preparadas contra inyecciones SQL[cite: 4, 6, 8].
- **Base de Datos:** MySQL 8.0+ (Motor InnoDB) normalizado a Tercera Forma Normal (3FN) con soporte para disparadores de control de aforo.
- **Servidor Local / Entorno:** XAMPP o Laragon (Servidor Apache) y Visual Studio Code.
- **Control de Versiones:** Git y GitHub Desktop.

---

## 📂 4. Estructura del Repositorio
```text
Academia_Ritmo/
├── config/
│   └── db.php                     # Configuración centralizada de conexión PDO a MySQL
├── css/
│   ├── admin-styles.css           # Estilos para el panel administrativo
│   ├── log.css                    # Estilos visuales neón para autenticación y registro
│   └── styleR.css                 # Estilos específicos del panel de Recepción / Aforos
├── database/
│   └── schema.sql                 # Script DDL en 3FN, Triggers de sobrecupo y datos semilla
├── js/
│   ├── log.js                     # Autenticación asíncrona (login.php)
│   ├── mainR.js                   # Lógica de Recepción (CU-02), aforos e inscripciones[cite: 6]
│   └── register.js                # Validación y registro de usuarios
├── php/
│   ├── inscribir_alumno.php       # Endpoint para procesar inscripciones y validar aforos[cite: 4]
│   ├── login.php                  # Backend de autenticación, hash Bcrypt y ruteo por roles[cite: 4]
│   ├── logout.php                 # Cierre seguro de sesión de usuario[cite: 4]
│   ├── obtener_aforos.php         # Consulta dinámicamente el aforo consumido por taller[cite: 4]
│   ├── obtener_y_crear_grupos.php # Endpoint GET/POST para consultar y registrar talleres/alumnos
│   └── register.php               # Inserción de usuarios con encriptación Bcrypt[cite: 4]
├── public/
│   └── conexion.php               # Endpoint de prueba de conexión App-BD (Evidencia E1)
├── index.html                     # Panel Principal de Recepción / Control de Aforos (CU-02)[cite: 4]
├── log.html                       # Pantalla de Inicio de Sesión
├── register.html                  # Pantalla de Registro de Usuarios
└── README.md                      # Documentación oficial del repositorio

🚀 5. Guía de Instalación y Ejecución Local (Paso a Paso)Para que cualquier usuario, integrante o docente pueda poner en marcha el sistema localmente, siga rigurosamente estos pasos:   
Paso 1: Clonar el RepositorioAbre tu consola Git Bash o terminal dentro de la carpeta raíz de tu servidor 
Apache:En XAMPP: C:/xampp/htdocs/En Laragon: C:/laragon/www/
Ejecuta el siguiente comando:Bashgit clone [https://github.com/tu-usuario/Academia_Ritmo.git](https://github.com/tu-usuario/Academia_Ritmo.git)

Paso 2: Iniciar Servidores LocalesAbre el panel de control de XAMPP o Laragon y enciende los servicios de Apache y MySQL.

Paso 3: Configurar y Cargar la Base de DatosAbre tu navegador web e ingresa a phpMyAdmin (http://localhost/phpmyadmin/)[cite: 8].
Crea una nueva base de datos nombrada exactamente: academia_ritmo (Cotejamiento: utf8mb4_unicode_ci).
Selecciona la base de datos recién creada, dirígete a la pestaña Importar, selecciona el archivo ubicado en database/schema.sql y ejecútalo. 
Esto generará automáticamente las tablas normalizadas en 3FN, el disparador de sobrecupo (tg_bloquear_sobrecupo) y los usuarios iniciales de prueba[cite: 1, 8].

Paso 4: Validar Credenciales de ConexiónVerifica que el archivo /config/db.php esté vinculado correctamente a tu entorno local de MySQL:PHP<?php
$host = 'localhost';$db   = 'academia_ritmo';
$user = 'root'; // Usuario por defecto en XAMPP/Laragon$pass = '';     // Contraseña (en blanco por defecto en XAMPP)
$charset = 'utf8mb4';

Paso 5: Ejecutar la Aplicación en el NavegadorAbre tu navegador web e ingresa obligatoriamente a través del servidor local Apache (nunca abras los archivos directamente mediante doble clic o protocolo file:///)[cite: 1, 8]:

Prueba de Conexión App–BD (Evidencia E1): http://localhost/Academia_Ritmo/public/conexion.php[cite: 1]Pantalla de Inicio de Sesión: http://localhost/Academia_Ritmo/log.htmlPanel Principal de Recepción y Control de Aforos: http://localhost/Academia_Ritmo/index.html

🔑 6. Credenciales de Prueba del SistemaPara iniciar sesión y verificar los roles directamente en la plataforma[cite: 4, 8]:RolCorreo / UsuarioContraseñaVista AsignadaAdministradoradmin@ritmo.eduadmin123admin.htmlInstructorinstructor@ritmo.eduadmin123instructor.htmlRecepcionistarecepcion@ritmo.eduadmin123index.html