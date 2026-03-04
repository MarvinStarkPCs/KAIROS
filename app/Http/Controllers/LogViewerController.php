<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LogViewerController extends Controller
{
    public function index(Request $request)
    {
        abort_if(auth()->id() !== 1, 403);

        $logPath = storage_path('logs');
        $files = [];

        if (is_dir($logPath)) {
            $rawFiles = glob($logPath . '/*.log');
            rsort($rawFiles); // más recientes primero

            foreach ($rawFiles as $file) {
                $files[] = [
                    'name'      => basename($file),
                    'size'      => $this->formatSize(filesize($file)),
                    'size_raw'  => filesize($file),
                    'modified'  => date('Y-m-d H:i:s', filemtime($file)),
                ];
            }
        }

        $selectedFile = $request->get('file') ?? (count($files) > 0 ? $files[0]['name'] : null);
        $search       = $request->get('search') ?? '';
        $level        = $request->get('level') ?? '';
        $dateFrom     = $request->get('date_from') ?? '';
        $dateTo       = $request->get('date_to') ?? '';
        $entries      = [];
        $totalLines   = 0;

        if ($selectedFile) {
            $fullPath = storage_path('logs/' . basename($selectedFile));

            if (file_exists($fullPath) && str_ends_with($selectedFile, '.log')) {
                $entries    = $this->parseLog($fullPath, $search, $level, $dateFrom, $dateTo);
                $totalLines = count($entries);
            }
        }

        return Inertia::render('Security/Logs/Index', [
            'files'        => $files,
            'selectedFile' => $selectedFile,
            'entries'      => array_values($entries),
            'totalLines'   => $totalLines,
            'filters'      => compact('search', 'level', 'dateFrom', 'dateTo'),
        ]);
    }

    private function parseLog(string $path, string $search = '', string $level = '', string $dateFrom = '', string $dateTo = ''): array
    {
        $content = file_get_contents($path);
        $entries = [];

        // Separar entradas de log (comienzan con [YYYY-MM-DD HH:MM:SS])
        $pattern = '/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (\w+)\.(\w+): (.*?)(?=\[\d{4}-\d{2}-\d{2}|\z)/s';
        preg_match_all($pattern, $content, $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            $entryLevel = strtoupper($match[3]);
            $entryDate  = substr($match[1], 0, 10); // YYYY-MM-DD
            $message    = trim($match[4]);

            // Filtrar por nivel
            if ($level && strtolower($entryLevel) !== strtolower($level)) {
                continue;
            }

            // Filtrar por rango de fechas
            if ($dateFrom && $entryDate < $dateFrom) {
                continue;
            }
            if ($dateTo && $entryDate > $dateTo) {
                continue;
            }

            // Filtrar por búsqueda
            if ($search && stripos($message, $search) === false && stripos($match[1], $search) === false) {
                continue;
            }

            $entries[] = [
                'datetime'    => $match[1],
                'environment' => $match[2],
                'level'       => $entryLevel,
                'message'     => strlen($message) > 2000 ? substr($message, 0, 2000) . '...' : $message,
            ];
        }

        return $entries;
    }

    private function formatSize(int $bytes): string
    {
        if ($bytes >= 1048576) return round($bytes / 1048576, 2) . ' MB';
        if ($bytes >= 1024)    return round($bytes / 1024, 2) . ' KB';
        return $bytes . ' B';
    }
}
