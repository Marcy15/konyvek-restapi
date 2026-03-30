<?php
declare(strict_types=1);

namespace App\Models;

final class Publisher extends BaseModel
{
    protected function table(): string
    {
        return 'publishers';
    }
}
