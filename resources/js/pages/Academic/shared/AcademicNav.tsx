import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { BarChart3, GraduationCap, Users } from 'lucide-react';

export type AcademicSection = 'overview' | 'students' | 'teachers';

const SECTIONS: {
    key: AcademicSection;
    label: string;
    href: string;
    icon: typeof BarChart3;
}[] = [
    {
        key: 'overview',
        label: 'Visión general',
        href: '/academico',
        icon: BarChart3,
    },
    {
        key: 'students',
        label: 'Progreso de estudiantes',
        href: '/academico/estudiantes',
        icon: Users,
    },
    {
        key: 'teachers',
        label: 'Avance de profesores',
        href: '/academico/profesores',
        icon: GraduationCap,
    },
];

/** Navegación entre las tres vistas del panel académico. */
export default function AcademicNav({ active }: { active: AcademicSection }) {
    return (
        <nav className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
            {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = section.key === active;

                return (
                    <Link
                        key={section.key}
                        href={section.href}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {section.label}
                    </Link>
                );
            })}
        </nav>
    );
}
