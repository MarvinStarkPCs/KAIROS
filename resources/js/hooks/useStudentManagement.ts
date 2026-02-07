import { useState, useCallback } from 'react';
import type { Student, DatosMusicales } from '@/types/matricula';

// Tipos para campos de estudiante
type StudentField = keyof Student;
type MusicalDataField = keyof DatosMusicales;

// Tipos para valores de campos
type StudentFieldValue<K extends StudentField> = Student[K];
type MusicalDataFieldValue<K extends MusicalDataField> = DatosMusicales[K];

export interface UseStudentManagementReturn {
    students: Student[];
    currentIndex: number;
    currentStudent: Student | undefined;
    setCurrentIndex: (index: number) => void;
    createNewStudent: () => Student;
    addStudent: () => Student[];
    removeStudent: (index: number) => Student[];
    updateStudentField: <K extends StudentField>(index: number, field: K, value: StudentFieldValue<K>) => Student[];
    updateMusicalData: <K extends MusicalDataField>(index: number, field: K, value: MusicalDataFieldValue<K>) => Student[];
    setStudentsData: (newStudents: Student[]) => void;
}

export function useStudentManagement(initialStudents: Student[] = []): UseStudentManagementReturn {
    const [students, setStudents] = useState<Student[]>(initialStudents);
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentStudent = students[currentIndex];

    const createNewStudent = useCallback((): Student => ({
        name: '',
        last_name: '',
        email: '',
        document_type: 'TI',
        document_number: '',
        birth_place: '',
        birth_date: '',
        gender: 'M',
        datos_musicales: {
            plays_instrument: false,
            instruments_played: '',
            has_music_studies: false,
            music_schools: '',
            modality: '',
        },
        program_id: '',
        schedule_id: '',
    }), []);

    const addStudent = useCallback(() => {
        const newStudents = [...students, createNewStudent()];
        setStudents(newStudents);
        setCurrentIndex(newStudents.length - 1);
        return newStudents;
    }, [students, createNewStudent]);

    const removeStudent = useCallback((index: number) => {
        const newStudents = students.filter((_, i) => i !== index);
        setStudents(newStudents);

        if (currentIndex >= newStudents.length) {
            setCurrentIndex(Math.max(0, newStudents.length - 1));
        }

        return newStudents;
    }, [students, currentIndex]);

    // Método type-safe para actualizar campos directos del estudiante
    const updateStudentField = useCallback(<K extends StudentField>(
        index: number,
        field: K,
        value: StudentFieldValue<K>
    ) => {
        const newStudents = [...students];
        newStudents[index] = {
            ...newStudents[index],
            [field]: value,
        };
        setStudents(newStudents);
        return newStudents;
    }, [students]);

    // Método type-safe para actualizar datos musicales
    const updateMusicalData = useCallback(<K extends MusicalDataField>(
        index: number,
        field: K,
        value: MusicalDataFieldValue<K>
    ) => {
        const newStudents = [...students];
        newStudents[index] = {
            ...newStudents[index],
            datos_musicales: {
                ...newStudents[index].datos_musicales,
                [field]: value,
            },
        };
        setStudents(newStudents);
        return newStudents;
    }, [students]);

    const setStudentsData = useCallback((newStudents: Student[]) => {
        setStudents(newStudents);
    }, []);

    return {
        students,
        currentIndex,
        currentStudent,
        setCurrentIndex,
        createNewStudent,
        addStudent,
        removeStudent,
        updateStudentField,
        updateMusicalData,
        setStudentsData,
    };
}