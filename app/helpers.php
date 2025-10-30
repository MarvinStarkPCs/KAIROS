<?php

use App\Helpers\FlashHelper;

if (! function_exists('flash_success')) {
    /**
     * Flash a success message to the session.
     */
    function flash_success(string $message): void
    {
        FlashHelper::success($message);
    }
}

if (! function_exists('flash_error')) {
    /**
     * Flash an error message to the session.
     */
    function flash_error(string $message): void
    {
        FlashHelper::error($message);
    }
}

if (! function_exists('flash_info')) {
    /**
     * Flash an info message to the session.
     */
    function flash_info(string $message): void
    {
        FlashHelper::info($message);
    }
}

if (! function_exists('flash_warning')) {
    /**
     * Flash a warning message to the session.
     */
    function flash_warning(string $message): void
    {
        FlashHelper::warning($message);
    }
}
