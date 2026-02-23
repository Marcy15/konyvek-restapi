<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Validator;
use App\Models\Rating;

final class RatingController
{
    private Rating $model;

    public function __construct()
    {
        $this->model = new Rating();
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
            return ['status' => 404, 'data' => ['error' => 'not_found', 'message' => 'Rating not found']];
        }
        return ['status' => 200, 'data' => $row];
    }

    public function storeForBook(Request $request, array $params): array
    {
        $bookId = (int) ($params['id'] ?? 0);
        $payload = $request->json ?? [];
        $missing = Validator::requireKeys($payload, ['score']);
        if ($missing !== []) {
            return ['status' => 422, 'data' => ['error' => 'validation_error', 'missing' => $missing]];
        }
        $score = (int) $payload['score'];
        if ($score < 1 || $score > 5) {
            return ['status' => 422, 'data' => ['error' => 'validation_error', 'message' => 'Score must be 1-5']];
        }
        $created = $this->model->create([
            'book_id' => $bookId,
            'score' => $score
        ]);
        return ['status' => 201, 'data' => $created];
    }

    public function update(Request $request, array $params): array
    {
        $id = (int) ($params['id'] ?? 0);
        if ($this->model->findById($id) === null) {
            return ['status' => 404, 'data' => ['error' => 'not_found', 'message' => 'Rating not found']];
        }
        $payload = $request->json ?? [];
        $data = [];
        if (array_key_exists('score', $payload)) {
            $score = (int) $payload['score'];
            if ($score < 1 || $score > 5) {
                return ['status' => 422, 'data' => ['error' => 'validation_error', 'message' => 'Score must be 1-5']];
            }
            $data['score'] = $score;
        }
        $updated = $this->model->update($id, $data);
        return ['status' => 200, 'data' => $updated ?? []];
    }

    public function destroy(Request $request, array $params): array
    {
        $id = (int) ($params['id'] ?? 0);
        $deleted = $this->model->delete($id);
        if (!$deleted) {
            return ['status' => 404, 'data' => ['error' => 'not_found', 'message' => 'Rating not found']];
        }
        return ['status' => 200, 'data' => ['deleted' => true]];
    }
}
