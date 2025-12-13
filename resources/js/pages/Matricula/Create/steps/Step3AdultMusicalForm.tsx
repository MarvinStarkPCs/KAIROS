import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MusicalDataFields } from '@/components/matricula/forms/MusicalDataFields';
import { ProgramSelector } from '@/components/matricula/forms/ProgramSelector';
import type { Responsable, AcademicProgram, FormErrors, DatosMusicales } from '@/types/matricula';

export interface Step3AdultMusicalFormProps {
    data: Responsable;
    programs: AcademicProgram[];
    errors: FormErrors;
    onChange: <K extends keyof Responsable>(field: K, value: Responsable[K]) => void;
}

/**
 * Paso 3 (Adultos): Formulario de datos musicales y selección de programa
 * Para cuando is_minor = false
 */
export function Step3AdultMusicalForm({
    data,
    programs,
    errors,
    onChange
}: Step3AdultMusicalFormProps) {
    // Construir objeto DatosMusicales desde Responsable
    const musicalData: DatosMusicales = {
        plays_instrument: data.plays_instrument,
        instruments_played: data.instruments_played,
        has_music_studies: data.has_music_studies,
        music_schools: data.music_schools,
        desired_instrument: data.desired_instrument,
        modality: data.modality,
        current_level: data.current_level
    };

    const handleMusicalDataChange = (field: string, value: string | number | boolean) => {
        onChange(field as keyof Responsable, value as any);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Información Musical</CardTitle>
                <CardDescription>
                    Complete la información sobre su experiencia musical y seleccione su programa
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Datos Musicales - Usando componente reutilizable */}
                <MusicalDataFields
                    namePrefix="responsable"
                    data={musicalData}
                    errors={{
                        plays_instrument: errors['responsable.plays_instrument'],
                        instruments_played: errors['responsable.instruments_played'],
                        has_music_studies: errors['responsable.has_music_studies'],
                        music_schools: errors['responsable.music_schools'],
                        desired_instrument: errors['responsable.desired_instrument'],
                        modality: errors['responsable.modality'],
                        current_level: errors['responsable.current_level']
                    }}
                    onChange={handleMusicalDataChange}
                    birthDate={data.birth_date}
                />

                {/* Separador */}
                <div className="border-t pt-6">
                    {/* Selector de Programa - Usando componente reutilizable */}
                    <ProgramSelector
                        programs={programs}
                        selectedProgramId={data.program_id}
                        selectedScheduleId={data.schedule_id}
                        onProgramChange={(value) => onChange('program_id', value)}
                        onScheduleChange={(value) => onChange('schedule_id', value)}
                        errors={{
                            program_id: errors['responsable.program_id'],
                            schedule_id: errors['responsable.schedule_id']
                        }}
                        showScheduleAsOptional
                    />
                </div>
            </CardContent>
        </Card>
    );
}
