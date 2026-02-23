<?php
declare(strict_types=1);

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
