<?php

namespace App\Support;

use Illuminate\Database\QueryException;
use PDOException;
use Throwable;

/** Reconoce los errores de "MySQL no disponible": servidor caído o sin conexiones libres. */
final class DatabaseDown
{
    /** 1040 demasiadas conexiones · 1203 límite del usuario · 2002 no responde · 2006/2013 se perdió la conexión. */
    private const CODES = '1040|1203|2002|2006|2013';

    public static function matches(Throwable $e): bool
    {
        for ($x = $e; $x !== null; $x = $x->getPrevious()) {
            if (($x instanceof QueryException || $x instanceof PDOException)
                && preg_match('/\[('.self::CODES.')\]/', $x->getMessage())) {
                return true;
            }
        }

        return false;
    }
}
