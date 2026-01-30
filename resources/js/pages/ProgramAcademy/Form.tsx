import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Music,
    Music2,
    Music3,
    Music4,
    Piano,
    Guitar,
    Drum,
    Mic,
    Mic2,
    MicVocal,
    Radio,
    Headphones,
    Headset,
    Volume2,
    Volume1,
    AudioLines,
    AudioWaveform,
    ListMusic,
    Disc,
    Disc2,
    Disc3,
    DiscAlbum,
    PlayCircle,
    PauseCircle,
    SkipForward,
    Shuffle,
    Repeat,
    Speaker,
    Megaphone,
    Bell,
    BellRing,
    Waves,
    Activity,
    Airplay,
    Cast,
    Tv,
    Monitor,
    Smartphone,
    Tablet,
    Watch,
    Star,
    Heart,
    Award,
    Trophy,
    Medal,
    Crown,
    Sparkles,
    Zap,
    Flame,
    Sun,
    Moon,
    CloudSun,
    Rainbow,
    Palette,
    Brush,
    PenTool,
    Feather,
    BookOpen,
    GraduationCap,
    School,
    Library,
    Users,
    UserCircle,
    Baby,
    PersonStanding,
    Hand,
    ThumbsUp,
    Smile,
    PartyPopper,
    Gift,
    Cake,
    type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import ProgramAcademyController from '@/actions/App/Http/Controllers/program_academy';
import { FormEvent } from 'react';

// Lista de iconos disponibles organizados por categoría
const MUSIC_ICONS: { name: string; icon: LucideIcon; label: string; category: string }[] = [
    // Música y Audio
    { name: 'music', icon: Music, label: 'Nota Musical', category: 'Música' },
    { name: 'music2', icon: Music2, label: 'Notas Musicales', category: 'Música' },
    { name: 'music3', icon: Music3, label: 'Corcheas', category: 'Música' },
    { name: 'music4', icon: Music4, label: 'Semicorcheas', category: 'Música' },
    { name: 'listMusic', icon: ListMusic, label: 'Lista Musical', category: 'Música' },
    { name: 'audioLines', icon: AudioLines, label: 'Líneas de Audio', category: 'Música' },
    { name: 'audioWaveform', icon: AudioWaveform, label: 'Onda de Audio', category: 'Música' },
    { name: 'waves', icon: Waves, label: 'Ondas', category: 'Música' },
    { name: 'activity', icon: Activity, label: 'Actividad Sonora', category: 'Música' },

    // Instrumentos
    { name: 'piano', icon: Piano, label: 'Piano / Teclado', category: 'Instrumentos' },
    { name: 'guitar', icon: Guitar, label: 'Guitarra', category: 'Instrumentos' },
    { name: 'drum', icon: Drum, label: 'Batería / Percusión', category: 'Instrumentos' },
    { name: 'mic', icon: Mic, label: 'Micrófono', category: 'Instrumentos' },
    { name: 'mic2', icon: Mic2, label: 'Micrófono Estudio', category: 'Instrumentos' },
    { name: 'micVocal', icon: MicVocal, label: 'Micrófono Vocal', category: 'Instrumentos' },
    { name: 'speaker', icon: Speaker, label: 'Altavoz', category: 'Instrumentos' },
    { name: 'megaphone', icon: Megaphone, label: 'Megáfono', category: 'Instrumentos' },

    // Reproducción
    { name: 'disc', icon: Disc, label: 'Disco', category: 'Reproducción' },
    { name: 'disc2', icon: Disc2, label: 'CD', category: 'Reproducción' },
    { name: 'disc3', icon: Disc3, label: 'Vinilo', category: 'Reproducción' },
    { name: 'discAlbum', icon: DiscAlbum, label: 'Álbum', category: 'Reproducción' },
    { name: 'playCircle', icon: PlayCircle, label: 'Reproducir', category: 'Reproducción' },
    { name: 'pauseCircle', icon: PauseCircle, label: 'Pausar', category: 'Reproducción' },
    { name: 'skipForward', icon: SkipForward, label: 'Siguiente', category: 'Reproducción' },
    { name: 'shuffle', icon: Shuffle, label: 'Aleatorio', category: 'Reproducción' },
    { name: 'repeat', icon: Repeat, label: 'Repetir', category: 'Reproducción' },

    // Audio y Escucha
    { name: 'headphones', icon: Headphones, label: 'Audífonos', category: 'Audio' },
    { name: 'headset', icon: Headset, label: 'Headset', category: 'Audio' },
    { name: 'volume2', icon: Volume2, label: 'Volumen Alto', category: 'Audio' },
    { name: 'volume1', icon: Volume1, label: 'Volumen Bajo', category: 'Audio' },
    { name: 'radio', icon: Radio, label: 'Radio', category: 'Audio' },
    { name: 'airplay', icon: Airplay, label: 'Airplay', category: 'Audio' },
    { name: 'cast', icon: Cast, label: 'Transmitir', category: 'Audio' },

    // Educación
    { name: 'graduationCap', icon: GraduationCap, label: 'Graduación', category: 'Educación' },
    { name: 'school', icon: School, label: 'Escuela', category: 'Educación' },
    { name: 'library', icon: Library, label: 'Biblioteca', category: 'Educación' },
    { name: 'bookOpen', icon: BookOpen, label: 'Libro Abierto', category: 'Educación' },
    { name: 'award', icon: Award, label: 'Premio', category: 'Educación' },
    { name: 'trophy', icon: Trophy, label: 'Trofeo', category: 'Educación' },
    { name: 'medal', icon: Medal, label: 'Medalla', category: 'Educación' },
    { name: 'crown', icon: Crown, label: 'Corona', category: 'Educación' },

    // Personas
    { name: 'users', icon: Users, label: 'Grupo', category: 'Personas' },
    { name: 'userCircle', icon: UserCircle, label: 'Usuario', category: 'Personas' },
    { name: 'baby', icon: Baby, label: 'Bebé / Kids', category: 'Personas' },
    { name: 'personStanding', icon: PersonStanding, label: 'Persona', category: 'Personas' },
    { name: 'hand', icon: Hand, label: 'Mano', category: 'Personas' },
    { name: 'thumbsUp', icon: ThumbsUp, label: 'Pulgar Arriba', category: 'Personas' },
    { name: 'smile', icon: Smile, label: 'Sonrisa', category: 'Personas' },

    // Creatividad
    { name: 'palette', icon: Palette, label: 'Paleta', category: 'Creatividad' },
    { name: 'brush', icon: Brush, label: 'Pincel', category: 'Creatividad' },
    { name: 'penTool', icon: PenTool, label: 'Pluma', category: 'Creatividad' },
    { name: 'feather', icon: Feather, label: 'Pluma Ligera', category: 'Creatividad' },
    { name: 'sparkles', icon: Sparkles, label: 'Destellos', category: 'Creatividad' },
    { name: 'star', icon: Star, label: 'Estrella', category: 'Creatividad' },
    { name: 'heart', icon: Heart, label: 'Corazón', category: 'Creatividad' },
    { name: 'zap', icon: Zap, label: 'Rayo', category: 'Creatividad' },
    { name: 'flame', icon: Flame, label: 'Llama', category: 'Creatividad' },

    // Naturaleza y Ambiente
    { name: 'sun', icon: Sun, label: 'Sol', category: 'Ambiente' },
    { name: 'moon', icon: Moon, label: 'Luna', category: 'Ambiente' },
    { name: 'cloudSun', icon: CloudSun, label: 'Día Nublado', category: 'Ambiente' },
    { name: 'rainbow', icon: Rainbow, label: 'Arcoíris', category: 'Ambiente' },
    { name: 'bell', icon: Bell, label: 'Campana', category: 'Ambiente' },
    { name: 'bellRing', icon: BellRing, label: 'Campana Sonando', category: 'Ambiente' },

    // Celebración
    { name: 'partyPopper', icon: PartyPopper, label: 'Fiesta', category: 'Celebración' },
    { name: 'gift', icon: Gift, label: 'Regalo', category: 'Celebración' },
    { name: 'cake', icon: Cake, label: 'Pastel', category: 'Celebración' },

    // Dispositivos
    { name: 'tv', icon: Tv, label: 'Televisión', category: 'Dispositivos' },
    { name: 'monitor', icon: Monitor, label: 'Monitor', category: 'Dispositivos' },
    { name: 'smartphone', icon: Smartphone, label: 'Teléfono', category: 'Dispositivos' },
    { name: 'tablet', icon: Tablet, label: 'Tablet', category: 'Dispositivos' },
    { name: 'watch', icon: Watch, label: 'Reloj', category: 'Dispositivos' },
];

// Agrupar iconos por categoría
const groupedIcons = MUSIC_ICONS.reduce((acc, icon) => {
    if (!acc[icon.category]) {
        acc[icon.category] = [];
    }
    acc[icon.category].push(icon);
    return acc;
}, {} as Record<string, typeof MUSIC_ICONS>);

interface Program {
    id: number;
    name: string;
    description: string | null;
    duration_months: number;
    status: 'active' | 'inactive';
    color: string;
    icon: string;
    is_demo: boolean;
}

interface FormProps {
    program?: Program;
}

export default function Form({ program }: FormProps) {
    const isEditing = !!program;

    const { data, setData, post, put, processing, errors } = useForm({
        name: program?.name || '',
        description: program?.description || '',
        duration_months: program?.duration_months || 1,
        status: program?.status || 'active',
        color: program?.color || '#3B82F6',
        icon: program?.icon || 'music',
        is_demo: program?.is_demo || false,
    });

    // Obtener el icono seleccionado
    const selectedIcon = MUSIC_ICONS.find(i => i.name === data.icon) || MUSIC_ICONS[0];
    const SelectedIconComponent = selectedIcon.icon;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(ProgramAcademyController.update({ program: program.id }).url);
        } else {
            post(ProgramAcademyController.store().url);
        }
    };

    return (
        <AppLayout>
            <Head title={isEditing ? 'Editar Programa' : 'Nuevo Programa'} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            href={ProgramAcademyController.index().url}
                            className="mb-2 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Volver a programas
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {isEditing ? 'Editar Programa Académico' : 'Nuevo Programa Académico'}
                        </h1>
                        <p className="mt-2 text-gray-600">
                            {isEditing
                                ? 'Actualiza la información del programa'
                                : 'Completa los datos del nuevo programa'}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div>
                            <Label htmlFor="name">
                                Nombre del Programa <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Ej: Programa de Piano Avanzado"
                                className="mt-1"
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Describe el programa académico..."
                                rows={4}
                                className="mt-1"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        {/* Duration */}
                        <div>
                            <Label htmlFor="duration_months">
                                Duración (meses) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="duration_months"
                                type="number"
                                min="1"
                                value={data.duration_months}
                                onChange={(e) => setData('duration_months', parseInt(e.target.value))}
                                className="mt-1"
                                placeholder="Ej: 12"
                            />
                            {errors.duration_months && (
                                <p className="mt-1 text-sm text-red-600">{errors.duration_months}</p>
                            )}
                            <p className="mt-1 text-sm text-gray-500">
                                Duración total del programa en meses
                            </p>
                        </div>

                        {/* Status */}
                        <div>
                            <Label htmlFor="status">
                                Estado <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as 'active' | 'inactive')}
                                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="active">Activo</option>
                                <option value="inactive">Inactivo</option>
                            </select>
                            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                        </div>

                        {/* Programa Demo */}
                        <div className="flex items-center space-x-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <Checkbox
                                id="is_demo"
                                checked={data.is_demo}
                                onCheckedChange={(checked) => setData('is_demo', checked as boolean)}
                            />
                            <div className="flex-1">
                                <Label htmlFor="is_demo" className="cursor-pointer font-medium">
                                    Programa Demo
                                </Label>
                                <p className="text-sm text-gray-600">
                                    Marcar este programa para mostrarlo en el formulario público de matrícula
                                </p>
                            </div>
                        </div>

                        {/* Icon Selector */}
                        <div>
                            <Label>
                                Icono del Programa <span className="text-red-500">*</span>
                            </Label>
                            <p className="mb-3 text-sm text-gray-500">
                                Selecciona un icono para identificar visualmente el programa
                            </p>

                            <div className="flex items-start gap-4">
                                {/* Preview */}
                                <div
                                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 shadow-sm"
                                    style={{
                                        backgroundColor: `${data.color}20`,
                                        borderColor: data.color,
                                    }}
                                >
                                    <SelectedIconComponent className="h-8 w-8" style={{ color: data.color }} />
                                </div>

                                {/* Select */}
                                <div className="flex-1">
                                    <Select value={data.icon} onValueChange={(value) => setData('icon', value)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecciona un icono">
                                                <div className="flex items-center gap-2">
                                                    <SelectedIconComponent className="h-4 w-4" />
                                                    <span>{selectedIcon.label}</span>
                                                    <span className="text-xs text-gray-400">({selectedIcon.category})</span>
                                                </div>
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="max-h-80">
                                            {Object.entries(groupedIcons).map(([category, icons]) => (
                                                <div key={category}>
                                                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                                                        {category}
                                                    </div>
                                                    {icons.map((item) => {
                                                        const IconComponent = item.icon;
                                                        return (
                                                            <SelectItem key={item.name} value={item.name}>
                                                                <div className="flex items-center gap-2">
                                                                    <IconComponent className="h-4 w-4" />
                                                                    <span>{item.label}</span>
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {selectedIcon.category} - {selectedIcon.label}
                                    </p>
                                </div>
                            </div>
                            {errors.icon && <p className="mt-1 text-sm text-red-600">{errors.icon}</p>}
                        </div>

                        {/* Color */}
                        <div>
                            <Label htmlFor="color">
                                Color del Programa <span className="text-red-500">*</span>
                            </Label>
                            <div className="mt-1 flex items-center gap-4">
                                <Input
                                    id="color"
                                    type="color"
                                    value={data.color}
                                    onChange={(e) => setData('color', e.target.value)}
                                    className="h-12 w-20 cursor-pointer"
                                />
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        placeholder="#3B82F6"
                                        pattern="^#[0-9A-Fa-f]{6}$"
                                        className="font-mono"
                                    />
                                </div>
                                <div
                                    className="flex h-12 w-24 items-center justify-center rounded-md border-2 border-gray-300 shadow-sm"
                                    style={{ backgroundColor: data.color }}
                                >
                                    <SelectedIconComponent className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            {errors.color && <p className="mt-1 text-sm text-red-600">{errors.color}</p>}
                            <p className="mt-1 text-sm text-gray-500">
                                Este color se usará para identificar el programa en el calendario de horarios
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
                            <Link href={ProgramAcademyController.index().url}>
                                <Button type="button" variant="outline">
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando...' : isEditing ? 'Actualizar Programa' : 'Crear Programa'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
