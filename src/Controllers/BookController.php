<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Validator;
use App\Models\Book;

final class BookController
{
    private Book $model;

    public function __construct()
    {
        $this->model = new Book();
    }

    public function index(Request $request, array $params): array
    {
        $items = $this->model->findAllWithMeta($request->query);
        return ['status' => 200, 'data' => ['items' => $items]];
    }

    public function show(Request $request, array $params): array
    {
        $id = (int) ($params['id'] ?? 0);
        $row = $this->model->findByIdWithMeta($id);
        if ($row === null) {
            return ['status' => 404, 'data' => ['error' => 'not_found', 'message' => 'Book not found']];
        }
        return ['status' => 200, 'data' => $row];
    }

    public function store(Request $request, array $params): array
    {
        $payload = $request->json ?? [];
        $missing = Validator::requireKeys($payload, ['title', 'isbn', 'price', 'cover_url', 'summary', 'author_id', 'publisher_id', 'category_id']);
        if ($missing !== []) {
            return ['status' => 422, 'data' => ['error' => 'validation_error', 'missing' => $missing]];
        }
        $created = $this->model->create([
            'title' => (string) $payload['title'],
            'isbn' => (string) $payload['isbn'],
            'price' => (float) $payload['price'],
            'cover_url' => (string) $payload['cover_url'],
            'summary' => (string) $payload['summary'],
            'author_id' => (int) $payload['author_id'],
            'publisher_id' => (int) $payload['publisher_id'],
            'category_id' => (int) $payload['category_id']
        ]);
        return ['status' => 201, 'data' => $created];
    }

    public function update(Request $request, array $params): array
    {
        $id = (int) ($params['id'] ?? 0);
        if ($this->model->findById($id) === null) {
            return ['status' => 404, 'data' => ['error' => 'not_found', 'message' => 'Book not found']];
        }
        $payload = $request->json ?? [];
        $allowed = ['title','isbn','price','cover_url','summary','author_id','publisher_id','category_id'];
        $data = [];
        foreach ($allowed as $k) {
            if (array_key_exists($k, $payload)) {
                $data[$k] = $payload[$k];
            }
        }
        $updated = $this->model->update($id, $data);
        return ['status' => 200, 'data' => $updated ?? []];
    }

    public function destroy(Request $request, array $params): array
    {
        $id = (int) ($params['id'] ?? 0);
        $deleted = $this->model->delete($id);
        if (!$deleted) {
            return ['status' => 404, 'data' => ['error' => 'not_found', 'message' => 'Book not found']];
        }
        return ['status' => 200, 'data' => ['deleted' => true]];
    }
}
