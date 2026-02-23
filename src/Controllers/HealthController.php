<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;

final class HealthController
{
    public function index(Request $request, array $params): array
    {
        return [
            'status' => 200,
            'data' => ['status' => 'ok']
        ];
    }
}
