import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { ModalitySelect } from '../ModalitySelect';
import type { DatosMusicales, StudyModality } from '@/types/matricula';
import { Music } from 'lucide-react';

export interface MusicalDataFieldsProps {
    namePrefix?: string;
    data: DatosMusicales;
    errors?: {
        plays_instrument?: string;
        instruments_played?: string;
        has_music_studies?: string;
        music_schools?: string;
        desired_instrument?: string;
        modality?: string;
        current_level?: string;
    };
    onChange: (field: string, value: string | number | boolean) => void;
    birthDate?: string; // Para validar edad vs modalidad
}

/**
 * Componente reutilizable para campos de datos musicales
 */
export function MusicalDataFields({
    namePrefix = '',
    data,
    errors = {},
    onChange,
    birthDate
}: MusicalDataFieldsProps) {
    const getFieldName = (field: string) => namePrefix ? `${namePrefix}.${field}` : field;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Music className="h-5 w-5" />
                <h3 className="font-semibold">Información Musical</h3>
            </div>

            {/* Toca algún instrumento */}
            <div className="space-y-2">
                <Label>¿Toca algún instrumento musical? *</Label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            checked={data.plays_instrument === true}
                            onChange={() => onChange('plays_instrument', true)}
                            className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                        />
                        <span>Sí</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            checked={data.plays_instrument === false}
                            onChange={() => onChange('plays_instrument', false)}
                            className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                        />
                        <span>No</span>
                    </label>
                </div>
                {errors.plays_instrument && <InputError message={errors.plays_instrument} />}
            </div>

            {/* Instrumentos que toca */}
            {data.plays_instrument && (
                <div>
                    <Label htmlFor={getFieldName('instruments_played')}>
                        ¿Cuál(es) instrumento(s)?
                    </Label>
                    <Input
                        id={getFieldName('instruments_played')}
                        type="text"
                        value={data.instruments_played}
                        onChange={(e) => onChange('instruments_played', e.target.value)}
                        placeholder="Ej: Guitarra, Piano"
                    />
                    {errors.instruments_played && <InputError message={errors.instruments_played} />}
                </div>
            )}

            {/* Estudios musicales */}
            <div className="space-y-2">
                <Label>¿Ha realizado estudios musicales? *</Label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            checked={data.has_music_studies === true}
                            onChange={() => onChange('has_music_studies', true)}
                            className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                        />
                        <span>Sí</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            checked={data.has_music_studies === false}
                            onChange={() => onChange('has_music_studies', false)}
                            className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                        />
                        <span>No</span>
                    </label>
                </div>
                {errors.has_music_studies && <InputError message={errors.has_music_studies} />}
            </div>

            {/* Instituciones musicales */}
            {data.has_music_studies && (
                <div>
                    <Label htmlFor={getFieldName('music_schools')}>
                        ¿En qué institución(es)?
                    </Label>
                    <Textarea
                        id={getFieldName('music_schools')}
                        value={data.music_schools}
                        onChange={(e) => onChange('music_schools', e.target.value)}
                        placeholder="Nombre de la(s) institución(es) musical(es)"
                        rows={2}
                    />
                    {errors.music_schools && <InputError message={errors.music_schools} />}
                </div>
            )}

            {/* Instrumento deseado */}
            <div>
                <Label htmlFor={getFieldName('desired_instrument')}>
                    ¿Qué instrumento desea estudiar? *
                </Label>
                <Input
                    id={getFieldName('desired_instrument')}
                    type="text"
                    value={data.desired_instrument}
                    onChange={(e) => onChange('desired_instrument', e.target.value)}
                    placeholder="Ej: Guitarra"
                />
                {errors.desired_instrument && <InputError message={errors.desired_instrument} />}
            </div>

            {/* Modalidad */}
            <ModalitySelect
                value={data.modality}
                onChange={(value) => onChange('modality', value as StudyModality)}
                error={errors.modality}
                birthDate={birthDate}
            />
        </div>
    );
}
