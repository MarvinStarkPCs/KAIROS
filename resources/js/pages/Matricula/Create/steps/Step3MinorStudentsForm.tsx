import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonalDataFields } from '@/components/matricula/forms/PersonalDataFields';
import { MusicalDataFields } from '@/components/matricula/forms/MusicalDataFields';
import { ProgramSelector } from '@/components/matricula/forms/ProgramSelector';
import { StudentTabs } from '@/components/matricula/students/StudentTabs';
import type { Student, AcademicProgram, FormErrors, DatosMusicales } from '@/types/matricula';
import { Music2 } from 'lucide-react';
import { validateStudent } from '@/utils/matricula-validation';
import { MAX_STUDENTS_PER_ENROLLMENT } from '@/utils/matricula-constants';

export interface Step3MinorStudentsFormProps {
    students: Student[];
    currentIndex: number;
    programs: AcademicProgram[];
    errors: FormErrors;
    onCurrentIndexChange: (index: number) => void;
    onAddStudent: () => void;
    onRemoveStudent: (index: number) => void;
    onUpdateStudent: (index: number, field: string, value: any) => void;
}

/**
 * Paso 3 (Menores): Formulario de estudiantes menores con navegación por tabs
 * Para cuando is_minor = true
 */
export function Step3MinorStudentsForm({
    students,
    currentIndex,
    programs,
    errors,
    onCurrentIndexChange,
    onAddStudent,
    onRemoveStudent,
    onUpdateStudent
}: Step3MinorStudentsFormProps) {
    const currentStudent = students[currentIndex];

    if (!currentStudent) {
        return null;
    }

    const musicalData: DatosMusicales = {
        plays_instrument: currentStudent.datos_musicales.plays_instrument,
        instruments_played: currentStudent.datos_musicales.instruments_played,
        has_music_studies: currentStudent.datos_musicales.has_music_studies,
        music_schools: currentStudent.datos_musicales.music_schools,
        modality: currentStudent.datos_musicales.modality,
    };

    return (
        <Card className="border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                        <Music2 className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl">Datos de los Estudiantes</CardTitle>
                </div>
                <CardDescription className="text-sm sm:text-base">
                    Ingrese los datos de cada estudiante menor de edad
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                {/* Tabs de estudiantes */}
                <StudentTabs
                    students={students}
                    currentIndex={currentIndex}
                    onTabChange={onCurrentIndexChange}
                    onAddStudent={onAddStudent}
                    onRemoveStudent={onRemoveStudent}
                    validateStudent={(student) => validateStudent(student)}
                    maxStudents={MAX_STUDENTS_PER_ENROLLMENT}
                    programs={programs}
                />

                {/* Formulario del estudiante actual */}
                <div className="space-y-6 pt-4 border-t">
                    {/* Datos Personales */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Datos Personales</h3>
                        <PersonalDataFields
                            namePrefix={`estudiantes.${currentIndex}`}
                            data={{
                                name: currentStudent.name,
                                last_name: currentStudent.last_name,
                                document_type: currentStudent.document_type,
                                document_number: currentStudent.document_number,
                                birth_place: currentStudent.birth_place,
                                birth_date: currentStudent.birth_date,
                                gender: currentStudent.gender,
                                email: currentStudent.email
                            }}
                            errors={{
                                name: errors[`estudiantes.${currentIndex}.name`],
                                last_name: errors[`estudiantes.${currentIndex}.last_name`],
                                document_type: errors[`estudiantes.${currentIndex}.document_type`],
                                document_number: errors[`estudiantes.${currentIndex}.document_number`],
                                birth_place: errors[`estudiantes.${currentIndex}.birth_place`],
                                birth_date: errors[`estudiantes.${currentIndex}.birth_date`],
                                gender: errors[`estudiantes.${currentIndex}.gender`],
                                email: errors[`estudiantes.${currentIndex}.email`]
                            }}
                            onChange={(field, value) => onUpdateStudent(currentIndex, field, value)}
                            includeEmail
                            emailLabel="Correo Electrónico del Estudiante (Opcional)"
                            emailHelper="Si el estudiante tiene correo, podrá acceder a ver su avance"
                        />
                    </div>

                    {/* Datos Musicales */}
                    <div className="space-y-4 border-t pt-6">
                        <h3 className="font-semibold text-lg border-b pb-2">Datos Musicales</h3>
                        <MusicalDataFields
                            namePrefix={`estudiantes.${currentIndex}.datos_musicales`}
                            data={musicalData}
                            errors={{
                                plays_instrument: errors[`estudiantes.${currentIndex}.datos_musicales.plays_instrument`],
                                instruments_played: errors[`estudiantes.${currentIndex}.datos_musicales.instruments_played`],
                                has_music_studies: errors[`estudiantes.${currentIndex}.datos_musicales.has_music_studies`],
                                music_schools: errors[`estudiantes.${currentIndex}.datos_musicales.music_schools`],
                                modality: errors[`estudiantes.${currentIndex}.datos_musicales.modality`],
                            }}
                            onChange={(field, value) => {
                                onUpdateStudent(currentIndex, `datos_musicales.${field}`, value);
                            }}
                            birthDate={currentStudent.birth_date}
                            isMinor
                        />
                    </div>

                    {/* Selector de Programa */}
                    <div className="space-y-4 border-t pt-6">
                        <h3 className="font-semibold text-lg border-b pb-2">Programa Académico</h3>
                        <ProgramSelector
                            programs={programs}
                            selectedProgramId={currentStudent.program_id}
                            selectedScheduleId={currentStudent.schedule_id}
                            onProgramChange={(value) => onUpdateStudent(currentIndex, 'program_id', value)}
                            onScheduleChange={(value) => onUpdateStudent(currentIndex, 'schedule_id', value)}
                            errors={{
                                program_id: errors[`estudiantes.${currentIndex}.program_id`],
                                schedule_id: errors[`estudiantes.${currentIndex}.schedule_id`]
                            }}
                            showScheduleAsOptional
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
