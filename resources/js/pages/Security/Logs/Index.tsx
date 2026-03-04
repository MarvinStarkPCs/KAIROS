import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Search, X, RefreshCw, AlertCircle, AlertTriangle, Info, Bug } from 'lucide-react';

interface LogFile {
    name: string;
    size: string;
    size_raw: number;
    modified: string;
}

interface LogEntry {
    datetime: string;
    environment: string;
    level: string;
    message: string;
}

interface Props {
    files: LogFile[];
    selectedFile: string | null;
    entries: LogEntry[];
    totalLines: number;
    filters: {
        search: string;
        level: string;
        dateFrom: string;
        dateTo: string;
    };
}

const LEVELS = ['', 'ERROR', 'WARNING', 'INFO', 'DEBUG', 'CRITICAL', 'NOTICE'];

const levelConfig: Record<string, { color: string; icon: React.ReactNode; badge: string }> = {
    ERROR:    { color: 'bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500',    icon: <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />,    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
    CRITICAL: { color: 'bg-red-50 dark:bg-red-950/30 border-l-4 border-red-700',   icon: <AlertCircle className="h-4 w-4 text-red-700 shrink-0 mt-0.5" />,   badge: 'bg-red-200 text-red-800 dark:bg-red-900/60 dark:text-red-200' },
    WARNING:  { color: 'bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500', icon: <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />, badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
    NOTICE:   { color: 'bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-400',  icon: <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />,          badge: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300' },
    INFO:     { color: 'bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500',  icon: <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />,          badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    DEBUG:    { color: 'bg-muted/50 border-l-4 border-muted-foreground/30',           icon: <Bug className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />,   badge: 'bg-muted text-muted-foreground' },
};

const defaultConfig = { color: 'bg-muted/30 border-l-4 border-border', icon: <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />, badge: 'bg-muted text-muted-foreground' };

export default function LogsIndex({ files, selectedFile, entries, totalLines, filters }: Props) {
    const [search, setSearch]       = useState(filters.search || '');
    const [level, setLevel]         = useState(filters.level || '');
    const [dateFrom, setDateFrom]   = useState(filters.dateFrom || '');
    const [dateTo, setDateTo]       = useState(filters.dateTo || '');
    const [expanded, setExpanded]   = useState<number | null>(null);

    const applyFilters = (params: { file?: string; search?: string; level?: string; dateFrom?: string; dateTo?: string }) => {
        router.get('/logs', {
            file:      params.file      ?? selectedFile ?? '',
            search:    params.search    ?? search,
            level:     params.level     ?? level,
            date_from: params.dateFrom  ?? dateFrom,
            date_to:   params.dateTo    ?? dateTo,
        }, { preserveScroll: true, replace: true });
    };

    const handleFileSelect = (name: string) => {
        setSearch('');
        setLevel('');
        setDateFrom('');
        setDateTo('');
        router.get('/logs', { file: name }, { preserveScroll: false, replace: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search, level, dateFrom, dateTo });
    };

    const clearFilters = () => {
        setSearch('');
        setLevel('');
        setDateFrom('');
        setDateTo('');
        applyFilters({ search: '', level: '', dateFrom: '', dateTo: '' });
    };

    const hasFilters = search || level || dateFrom || dateTo;

    return (
        <AppLayout>
            <Head title="Logs del Sistema" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                            <FileText className="h-7 w-7" />
                            Logs del Sistema
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Visor de archivos de log de Laravel — acceso exclusivo super admin
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => applyFilters({})}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Actualizar
                    </Button>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Archivos de log */}
                    <div className="col-span-12 md:col-span-3">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Archivos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {files.length === 0 ? (
                                    <p className="px-4 py-3 text-sm text-muted-foreground">No hay archivos de log.</p>
                                ) : (
                                    <ul className="divide-y divide-border">
                                        {files.map((file) => (
                                            <li key={file.name}>
                                                <button
                                                    onClick={() => handleFileSelect(file.name)}
                                                    className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors ${
                                                        selectedFile === file.name ? 'bg-muted font-medium' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                                        <span className="text-sm truncate">{file.name}</span>
                                                    </div>
                                                    <div className="mt-1 flex gap-3 text-xs text-muted-foreground ml-6">
                                                        <span>{file.size}</span>
                                                        <span>{file.modified.slice(0, 10)}</span>
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Visor de entradas */}
                    <div className="col-span-12 md:col-span-9 space-y-4">
                        {/* Filtros */}
                        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar en los logs..."
                                    className="pl-9"
                                />
                            </div>
                            <select
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                            >
                                <option value="">Todos los niveles</option>
                                {LEVELS.filter(Boolean).map((l) => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-40"
                                    title="Desde"
                                />
                                <span className="text-muted-foreground text-sm">—</span>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-40"
                                    title="Hasta"
                                />
                            </div>
                            <Button type="submit" variant="outline">
                                <Search className="mr-2 h-4 w-4" />
                                Filtrar
                            </Button>
                            {hasFilters && (
                                <Button type="button" variant="ghost" onClick={clearFilters}>
                                    <X className="mr-2 h-4 w-4" />
                                    Limpiar
                                </Button>
                            )}
                        </form>

                        {/* Info */}
                        {selectedFile && (
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>
                                    Mostrando <strong>{entries.length}</strong> de <strong>{totalLines}</strong> entradas
                                </span>
                                <span className="font-mono text-xs">{selectedFile}</span>
                            </div>
                        )}

                        {/* Entradas */}
                        {!selectedFile ? (
                            <Card>
                                <CardContent className="py-16 text-center text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p>Selecciona un archivo de log para verlo</p>
                                </CardContent>
                            </Card>
                        ) : entries.length === 0 ? (
                            <Card>
                                <CardContent className="py-16 text-center text-muted-foreground">
                                    <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p>No se encontraron entradas con los filtros aplicados</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-2">
                                {entries.map((entry, i) => {
                                    const cfg = levelConfig[entry.level] ?? defaultConfig;
                                    const isExpanded = expanded === i;
                                    const preview = entry.message.split('\n')[0];
                                    const hasMore = entry.message.includes('\n');

                                    return (
                                        <div
                                            key={i}
                                            className={`rounded-md p-3 text-sm ${cfg.color} cursor-pointer hover:opacity-90 transition-opacity`}
                                            onClick={() => setExpanded(isExpanded ? null : i)}
                                        >
                                            <div className="flex items-start gap-3">
                                                {cfg.icon}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold ${cfg.badge}`}>
                                                            {entry.level}
                                                        </span>
                                                        <span className="font-mono text-xs text-muted-foreground">
                                                            {entry.datetime}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            [{entry.environment}]
                                                        </span>
                                                    </div>
                                                    <p className="font-mono text-xs break-all whitespace-pre-wrap">
                                                        {isExpanded ? entry.message : preview}
                                                    </p>
                                                    {hasMore && !isExpanded && (
                                                        <span className="text-xs text-muted-foreground mt-1 block">
                                                            Click para ver más...
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
