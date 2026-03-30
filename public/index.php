<?php
declare(strict_types=1);

// Ha statikus fájlt kérnek (CSS, JS, HTML), szolgáltasd ki
$requestUri = $_SERVER['REQUEST_URI'];
$filePath = __DIR__ . parse_url($requestUri, PHP_URL_PATH);

// Statikus fájlok kezelése (CSS, JS, HTML)
if (preg_match('/\.(css|js|html)$/', $filePath) && file_exists($filePath)) {
    $mimeTypes = [
        'css' => 'text/css',
        'js' => 'application/javascript',
        'html' => 'text/html'
    ];
    $extension = pathinfo($filePath, PATHINFO_EXTENSION);
    header('Content-Type: ' . ($mimeTypes[$extension] ?? 'text/plain'));
    readfile($filePath);
    exit;
}

// Ha a root-ot kérik (/) -> frontend.html
if ($requestUri === '/' || $requestUri === '') {
    header('Location: /frontend.html');
    exit;
}

// Minden más -> API routing
require __DIR__ . '/../src/bootstrap.php';

use App\Core\Router;
use App\Core\Request;
use App\Core\Response;

try {
    $request = Request::fromGlobals();
    $router = new Router();
    require __DIR__ . '/../src/routes.php';
    $result = $router->dispatch($request);
    Response::json($result['data'], $result['status']);
} catch (Throwable $e) {
    Response::json([
        'error' => 'server_error',
        'message' => $e->getMessage()
    ], 500);
}
