<?php
// php/logout.php
session_start();

// 1. Limpiar todas las variables de la sesión ($_SESSION)
$_SESSION = array();

// 2. Destruir también la cookie de sesión en el navegador
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

// 3. Destruir la sesión en el servidor
session_destroy();

// 4. Evitar almacenamiento en caché y redirigir al inicio de sesión
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Location: ../log.html");
exit();