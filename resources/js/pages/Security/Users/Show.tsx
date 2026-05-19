import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Edit2 } from 'lucide-react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { getUserTypeColor } from './Show/helpers';
import type { ShowProps } from './Show/types';

import PersonalDataCard from './Show/cards/PersonalDataCard';
import ContactCard from './Show/cards/ContactCard';
import StudentProfileCard from './Show/cards/StudentProfileCard';
import TeacherProfileCard from './Show/cards/TeacherProfileCard';
import TeachingSchedulesCard from './Show/cards/TeachingSchedulesCard';
import EnrolledSchedulesCard from './Show/cards/EnrolledSchedulesCard';
import PaymentSummaryCard from './Show/cards/PaymentSummaryCard';
import GuardiansCard from './Show/cards/GuardiansCard';
import SimpleDependentsCard from './Show/cards/SimpleDependentsCard';
import DependentsWithSummaryCard from './Show/cards/DependentsWithSummaryCard';
import EnrollmentsCard from './Show/cards/EnrollmentsCard';
import SystemInfoCard from './Show/cards/SystemInfoCard';

export default function UsersShow({ user }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inicio', href: route('programas_academicos.index') },
        { title: 'Usuarios', href: route('usuarios.index') },
        { title: user.full_name, href: route('usuarios.show', user.id) },
    ];

    const isTeacher = user.roles.some((r) => r.name === 'Profesor');
    const isStudent = user.roles.some((r) => r.name === 'Estudiante');
    const isParent = user.roles.some((r) => r.name === 'Padre/Madre');

    const hasGuardians = user.parent || (user.parent_guardians && user.parent_guardians.length > 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Usuario: ${user.full_name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-background">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('usuarios.index')}>
                            <Button variant="ghost" size="sm">
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{user.full_name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge className={getUserTypeColor(user.user_type)}>{user.user_type}</Badge>
                                {user.roles.map((role) => (
                                    <Badge key={role.id} variant="outline">{role.name}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                    <Link href={route('usuarios.edit', user.id)}>
                        <Button className="bg-[#7a9b3c] hover:bg-[#6a8a2c]">
                            <Edit2 className="mr-2 h-4 w-4" />
                            Editar Usuario
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <PersonalDataCard user={user} />
                    <ContactCard user={user} />

                    {user.student_profile && (
                        <StudentProfileCard profile={user.student_profile} />
                    )}

                    {user.teacher_profile && (
                        <TeacherProfileCard profile={user.teacher_profile} />
                    )}

                    {isTeacher && user.teaching_schedules.length > 0 && (
                        <TeachingSchedulesCard schedules={user.teaching_schedules} />
                    )}

                    {isStudent && user.enrolled_schedules.length > 0 && (
                        <EnrolledSchedulesCard schedules={user.enrolled_schedules} />
                    )}

                    {isStudent && user.payment_summary.total > 0 && (
                        <PaymentSummaryCard
                            summary={user.payment_summary}
                            recentPayments={user.recent_payments}
                        />
                    )}

                    {hasGuardians && (
                        <GuardiansCard
                            parent={user.parent}
                            guardians={user.parent_guardians}
                        />
                    )}

                    {user.dependents.length > 0 && !isParent && !user.parent && (
                        <SimpleDependentsCard dependents={user.dependents} />
                    )}

                    {isParent && user.dependents_with_summary?.length > 0 && (
                        <DependentsWithSummaryCard dependents={user.dependents_with_summary} />
                    )}

                    {user.enrollments?.length > 0 && (
                        <EnrollmentsCard enrollments={user.enrollments} />
                    )}

                    <SystemInfoCard createdAt={user.created_at} updatedAt={user.updated_at} />
                </div>
            </div>
        </AppLayout>
    );
}
