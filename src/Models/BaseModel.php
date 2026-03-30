<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use PDO;

abstract class BaseModel
{
    protected PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::pdo();
    }

    abstract protected function table(): string;

    public function findAll(array $where = [], array $params = [], string $orderBy = 'id DESC'): array
    {
        $sql = 'SELECT * FROM ' . $this->table();
        if ($where !== []) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY ' . $orderBy;
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM ' . $this->table() . ' WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return is_array($row) ? $row : null;
    }

    public function create(array $data): array
    {
        $cols = array_keys($data);
        $place = array_map(fn ($c) => ':' . $c, $cols);
        $sql = 'INSERT INTO ' . $this->table()
            . ' (' . implode(',', $cols) . ') VALUES (' . implode(',', $place) . ')';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
        $id = (int) $this->pdo->lastInsertId();
        $row = $this->findById($id);
        return $row ?? ['id' => $id] + $data;
    }

    public function update(int $id, array $data): ?array
    {
        if ($data === []) {
            return $this->findById($id);
        }
        $sets = [];
        foreach (array_keys($data) as $col) {
            $sets[] = $col . '=:' . $col;
        }
        $data['id'] = $id;
        $sql = 'UPDATE ' . $this->table() . ' SET ' . implode(',', $sets) . ' WHERE id = :id';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
        return $this->findById($id);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM ' . $this->table() . ' WHERE id = :id');
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() > 0;
    }
}
