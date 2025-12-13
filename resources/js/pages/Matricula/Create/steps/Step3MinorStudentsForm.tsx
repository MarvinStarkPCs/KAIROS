import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonalDataFields } from '@/components/matricula/forms/PersonalDataFields';
import { MusicalDataFields } from '@/components/matricula/forms/MusicalDataFields';
import { ProgramSelector } from '@/components/matricula/forms/ProgramSelector';
import { StudentTabs } from '@/components/matricula/students/StudentTabs';
import type { Student, AcademicProgram, FormErrors, DatosMusicales } from '@/types/matricula';
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
        desired_instrument: currentStudent.datos_musicales.desired_instrument,
        modality: currentStudent.datos_musicales.modality,
        current_level: currentStudent.datos_musicales.current_level
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Datos de los Estudiantes</CardTitle>
                <CardDescription>
                    Ingrese los datos de cada estudiante menor de edad
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Tabs de estudiantes */}
                <StudentTabs
                    students={students}
                    currentIndex={currentIndex}
                    onTabChange={onCurrentIndexChange}
                    onAddStudent={onAddStudent}
                    onRemoveStudent={onRemoveStudent}
                    validateStudent={(student) => validateStudent(student)}
                    maxStudents={MAX_STUDENTS_PER_ENROLLMENT}
                />

                {/* Formulario del estudiante actual */}
                <div className="space-y-6 pt-4 border-t">
                    {/* Datos Personales */}
                    <div>
                        <h4 className="font-semibold text-lg mb-4">Datos Personales</h4>
                        <PersonalDataFields
                            namePrefix={`estudiantes.${currentIndex}`}
                            data={{
                                name: currentStudent.name,
                                last_name: currentStudent.last_name,
                                document_type: currentStudent.document_type,
                                document_number: currentStudent.document_number,
                                birth_place: currentStudent.birth_place,
                                birth_date: currentStudent.birth_date,
                                gender: currentStudent.gender
                            }}
                            errors={{
                                name: errors[`estudiantes.${currentIndex}.name`],
                                last_name: errors[`estudiantes.${currentIndex}.last_name`],
                                document_type: errors[`estudiantes.${currentIndex}.document_type`],
                                document_number: errors[`estudiantes.${currentIndex}.document_number`],
                                birth_place: errors[`estudiantes.${currentIndex}.birth_place`],
                                birth_date: errors[`estudiantes.${currentIndex}.birth_date`],
                                gender: errors[`estudiantes.${currentIndex}.gender`]
                            }}
                            onChange={(field, value) => onUpdateStudent(currentIndex, field, value)}
                            includeEmail={false}
                        />
                    </div>

                    {/* Datos Musicales */}
                    <div className="border-t pt-6">
                        <MusicalDataFields
                            namePrefix={`estudiantes.${currentIndex}.datos_musicales`}
                            data={musicalData}
                            errors={{
                                plays_instrument: errors[`estudiantes.${currentIndex}.datos_musicales.plays_instrument`],
                                instruments_played: errors[`estudiantes.${currentIndex}.datos_musicales.instruments_played`],
                                has_music_studies: errors[`estudiantes.${currentIndex}.datos_musicales.has_music_studies`],
                                music_schools: errors[`estudiantes.${currentIndex}.datos_musicales.music_schools`],
                                desired_instrument: errors[`estudiantes.${currentIndex}.datos_musicales.desired_instrument`],
                                modality: errors[`estudiantes.${currentIndex}.datos_musicales.modality`],
                                current_level: errors[`estudiantes.${currentIndex}.datos_musicales.current_level`]
                            }}
                            onChange={(field, value) => {
                                onUpdateStudent(currentIndex, `datos_musicales.${field}`, value);
                            }}
                            birthDate={currentStudent.birth_date}
                        />
                    </div>

                    {/* Selector de Programa */}
                    <div className="border-t pt-6">
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
