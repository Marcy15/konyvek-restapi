<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Validator;
use App\Models\Category;

final class CategoryController
{
    private Category $model;

    public function __construct()
    {
        $this->model = new Category();
    }

    public function index(Request $request, array $params): array
    {
        return ['status' => 200, 'data' => ['items' => $this->model->findAll(orderBy: 'id DESC')]];
    }

    public function show(Request $request, array $params): array
    {
        $id = (int) ($params['id'] ?? 0);
        $row = $this->model->findById($id);
        if ($row === null) {
            return ['status' => 404, 'data' => ['error' => 'not_found', 'message' => 'Category not found']];
        }
        return ['status' => 200, 'data' => $row];
    }

    public function store(Request $request, array $params): array
    {
        $payload = $request->json ?? [];
        $missing = Validator::requireKeys($payload, ['name']);
        if ($missing !== []) {
            return ['status' => 422, 'data' => ['error' => 'validation_error', 'missing' => $missing]];
        }
        $created = $this->model->create(['name' => (string) $payload['name']]);
        return ['status' => 201, 'data' => $created];
    }

    public function update(Request $request, array $params): array
    {
        $id = (int) ($params['id'] ?? 0);
        if ($this->model->findById($id) === null) {
            return ['status' => 404, 'data' => ['error' => 'not_found', 'message' => 'Category not found']];
        }
        $payload = $request->json ?? [];
        $data = [];
        if (array_key_exists('name', $payload)) {
            $data['name'] = (string) $payload['name'];
        }
        $updated = $this->model->update($id, $data);
        return ['status' => 200, 'data' => $updated ?? []];
    }

    public function destroy(Request $request, array $params): array
    {
        $id = (int) ($params['id'] ?? 0);
        $deleted = $this->model->delete($id);
        if (!$deleted) {
            return ['status' => 404, 'data' => ['error' => 'not_found', 'message' => 'Category not found']];
        }
        return ['status' => 200, 'data' => ['deleted' => true]];
    }
}
