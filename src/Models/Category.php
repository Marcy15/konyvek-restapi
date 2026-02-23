<?php
declare(strict_types=1);

namespace App\Models;

final class Category extends BaseModel
{
    protected function table(): string
    {
        return 'categories';
    }
}
