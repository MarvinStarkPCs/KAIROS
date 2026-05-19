import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { ProgramSelector } from '@/components/matricula/forms/ProgramSelector';
import type { Responsable, AcademicProgram, FormErrors } from '@/types/matricula';
import { Music2 } from 'lucide-react';

export interface Step3AdultMusicalFormProps {
    data: Responsable;
    programs: AcademicProgram[];
    errors: FormErrors;
    onChange: <K extends keyof Responsable>(field: K, value: Responsable[K]) => void;
    getModalityPrice?: (modality: string) => number | null;
    formatPrice?: (price: number) => string;
}

/**
 * Paso 3 (Adultos): Formulario de datos musicales y selección de programa
 * Para cuando is_minor = false
 */
export function Step3AdultMusicalForm({
    data,
    programs,
    errors,
    onChange,
    getModalityPrice,
    formatPrice,
}: Step3AdultMusicalFormProps) {
    const modalityPrice = getModalityPrice ? getModalityPrice('Linaje Big') : null;

    return (
        <Card className="border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                        <Music2 className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl">Datos Musicales y Programa</CardTitle>
                </div>
                <CardDescription className="text-sm sm:text-base">
                    Completa tu información musical y selecciona el programa al que deseas inscribirte
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">

                {/* Experiencia Musical */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Experiencia Musical</h3>

                    <div>
                        <Label>¿Ejecutas algún instrumento?</Label>
                        <div className="flex gap-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={data.plays_instrument === true}
                                    onChange={() => onChange('plays_instrument', true)}
                                    className="h-4 w-4 text-amber-600"
                                />
                                <span>Sí</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={data.plays_instrument === false}
                                    onChange={() => onChange('plays_instrument', false)}
                                    className="h-4 w-4 text-amber-600"
                                />
                                <span>No</span>
                            </label>
                        </div>
                    </div>

                    {data.plays_instrument && (
                        <div>
                            <Label>Indique cuál o cuáles instrumentos</Label>
                            <Textarea
                                value={data.instruments_played || ''}
                                onChange={(e) => onChange('instruments_played', e.target.value)}
                                placeholder="Ej: Piano, Guitarra, Canto"
                                rows={2}
                            />
                        </div>
                    )}

                    <div>
                        <Label>¿Tienes estudios formales de música?</Label>
                        <div className="flex gap-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={data.has_music_studies === true}
                                    onChange={() => onChange('has_music_studies', true)}
                                    className="h-4 w-4 text-amber-600"
                                />
                                <span>Sí</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={data.has_music_studies === false}
                                    onChange={() => onChange('has_music_studies', false)}
                                    className="h-4 w-4 text-amber-600"
                                />
                                <span>No</span>
                            </label>
                        </div>
                    </div>

                    {data.has_music_studies && (
                        <div>
                            <Label>Nombre(s) de escuela(s)</Label>
                            <Textarea
                                value={data.music_schools || ''}
                                onChange={(e) => onChange('music_schools', e.target.value)}
                                placeholder="Ej: Conservatorio Nacional"
                                rows={2}
                            />
                        </div>
                    )}

                    {/* Modalidad — display estático */}
                    <div>
                        <Label>Modalidad</Label>
                        <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md">
                            <p className="font-medium text-green-800 dark:text-green-300">Linaje Big (18+ años)</p>
                            {modalityPrice !== null && formatPrice && (
                                <p className="text-sm text-primary font-medium mt-1">
                                    Valor de matrícula: {formatPrice(modalityPrice)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Programa Académico */}
                <div className="space-y-4 border-t pt-6">
                    <h3 className="font-semibold text-lg border-b pb-2">Programa Académico</h3>
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
