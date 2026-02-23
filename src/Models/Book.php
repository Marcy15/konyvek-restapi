<?php
declare(strict_types=1);

namespace App\Models;

use PDO;

final class Book extends BaseModel
{
    protected function table(): string
    {
        return 'books';
    }

    public function findAllWithMeta(array $filters): array
    {
        $where = [];
        $params = [];
        if (isset($filters['author_id'])) {
            $where[] = 'b.author_id = :author_id';
            $params['author_id'] = (int) $filters['author_id'];
        }
        if (isset($filters['publisher_id'])) {
            $where[] = 'b.publisher_id = :publisher_id';
            $params['publisher_id'] = (int) $filters['publisher_id'];
        }
        if (isset($filters['category_id'])) {
            $where[] = 'b.category_id = :category_id';
            $params['category_id'] = (int) $filters['category_id'];
        }
        if (isset($filters['q']) && trim((string) $filters['q']) !== '') {
            $where[] = '(b.title LIKE :q OR b.isbn LIKE :q OR b.summary LIKE :q)';
            $params['q'] = '%' . trim((string) $filters['q']) . '%';
        }

        $sql = 'SELECT b.*,
            a.name AS author_name,
            p.name AS publisher_name,
            c.name AS category_name,
            COALESCE(AVG(r.score), 0) AS avg_rating,
            COUNT(r.id) AS ratings_count
        FROM books b
        LEFT JOIN authors a ON a.id = b.author_id
        LEFT JOIN publishers p ON p.id = b.publisher_id
        LEFT JOIN categories c ON c.id = b.category_id
        LEFT JOIN ratings r ON r.book_id = b.id';

        if ($where !== []) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' GROUP BY b.id ORDER BY b.id DESC';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findByIdWithMeta(int $id): ?array
    {
        $sql = 'SELECT b.*,
            a.name AS author_name,
            a.bio AS author_bio,
            p.name AS publisher_name,
            c.name AS category_name,
            COALESCE(AVG(r.score), 0) AS avg_rating,
            COUNT(r.id) AS ratings_count
        FROM books b
        LEFT JOIN authors a ON a.id = b.author_id
        LEFT JOIN publishers p ON p.id = b.publisher_id
        LEFT JOIN categories c ON c.id = b.category_id
        LEFT JOIN ratings r ON r.book_id = b.id
        WHERE b.id = :id
        GROUP BY b.id
        LIMIT 1';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return is_array($row) ? $row : null;
    }
}
