<?php
declare(strict_types=1);

namespace App\Models;

final class Rating extends BaseModel
{
    protected function table(): string
    {
        return 'ratings';
    }
}
