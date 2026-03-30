<?php
declare(strict_types=1);

namespace App\Models;

final class Author extends BaseModel
{
    protected function table(): string
    {
        return 'authors';
    }
}
