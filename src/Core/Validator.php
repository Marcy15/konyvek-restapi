<?php
declare(strict_types=1);

namespace App\Core;

final class Validator
{
    public static function requireKeys(array $data, array $keys): array
    {
        $missing = [];
        foreach ($keys as $k) {
            if (!array_key_exists($k, $data)) {
                $missing[] = $k;
            }
        }
        return $missing;
    }
}
