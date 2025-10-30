<?php

namespace App\Helpers;

class FlashHelper
{
    /**
     * Flash a success message to the session.
     */
    public static function success(string $message): void
    {
        session()->flash('success', $message);
    }

    /**
     * Flash an error message to the session.
     */
    public static function error(string $message): void
    {
        session()->flash('error', $message);
    }

    /**
     * Flash an info message to the session.
     */
    public static function info(string $message): void
    {
        session()->flash('info', $message);
    }

    /**
     * Flash a warning message to the session.
     */
    public static function warning(string $message): void
    {
        session()->flash('warning', $message);
    }
}
