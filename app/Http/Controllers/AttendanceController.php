<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    /**
     * Display attendance control dashboard
     */
    public function index()
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        // Obtener el día de la semana en español
        $daysMapping = [
            'Monday' => 'lunes',
            'Tuesday' => 'martes',
            'Wednesday' => 'miércoles',
            'Thursday' => 'jueves',
            'Friday' => 'viernes',
            'Saturday' => 'sábado',
            'Sunday' => 'domingo',
        ];
        $todayDayName = $daysMapping[$today->format('l')] ?? 'lunes';

        // Obtener los horarios que tienen clase hoy
        $todaySchedules = Schedule::with(['enrollments' => function($query) {
            $query->where('status', 'enrolled')->with('student');
        }, 'professor', 'academicProgram'])
            ->where('status', 'active')
            ->where('days_of_week', 'like', '%' . $todayDayName . '%')
            ->get();

        // Get today's attendance records
        $todayAttendances = Attendance::with(['student', 'schedule.professor', 'schedule.academicProgram'])
            ->whereDate('class_date', $today)
            ->get();

        // Calculate today's stats
        $totalStudentsToday = $todaySchedules->sum(fn($schedule) => $schedule->enrollments->count());
        $presentToday = $todayAttendances->where('status', 'present')->count();
        $absentToday = $todayAttendances->where('status', 'absent')->count();
        $lateToday = $todayAttendances->where('status', 'late')->count();

        $percentageToday = $totalStudentsToday > 0
            ? round(($presentToday / $totalStudentsToday) * 100, 1) . '%'
            : '0%';

        // Calculate monthly average
        $monthlyAttendances = Attendance::whereBetween('class_date', [$startOfMonth, $endOfMonth])
            ->get();

        $monthlyTotal = $monthlyAttendances->count();
        $monthlyPresent = $monthlyAttendances->whereIn('status', ['present', 'late'])->count();
        $monthlyAverage = $monthlyTotal > 0
            ? round(($monthlyPresent / $monthlyTotal) * 100, 1) . '%'
            : '0%';

        // Format attendance records for display
        $asistencias = $todayAttendances->map(function ($attendance) {
            $status = match($attendance->status) {
                'present' => 'presente',
                'absent' => 'ausente',
                'late' => 'tardanza',
                'excused' => 'justificado',
                default => 'presente'
            };

            return [
                'id' => $attendance->id,
                'hora' => $attendance->schedule?->start_time ?? 'N/A',
                'estudiante' => [
                    'nombre' => $attendance->student->name,
                    'nivel' => 'Estudiante',
                    'avatar' => null,
                ],
                'clase' => $attendance->schedule?->academicProgram?->name ?? 'Clase General',
                'tipoClase' => 'general',
                'profesor' => [
                    'nombre' => $attendance->schedule?->professor?->name ?? 'N/A',
                    'avatar' => null,
                ],
                'estado' => $status,
                'horaLlegada' => $attendance->created_at->format('H:i'),
                'acciones' => ['editar', 'contactar'],
            ];
        });

        // Find students with attendance issues
        $alertas = $this->getStudentAlerts();

        return Inertia::render('Assists/Index', [
            'asistenciaHoy' => [
                'total' => $totalStudentsToday,
                'presentes' => $presentToday,
                'porcentaje' => $percentageToday,
            ],
            'ausencias' => $absentToday,
            'tardanzas' => $lateToday,
            'promedioMensual' => $monthlyAverage,
            'asistencias' => $asistencias,
            'alertas' => $alertas,
        ]);
    }

    /**
     * Store a new attendance record
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'schedule_id' => 'required|exists:schedules,id',
            'class_date' => 'required|date',
            'status' => 'required|in:present,absent,late,excused',
            'notes' => 'nullable|string|max:500',
        ], [
            'student_id.required' => 'El estudiante es obligatorio',
            'student_id.exists' => 'El estudiante seleccionado no existe',
            'schedule_id.required' => 'El horario es obligatorio',
            'schedule_id.exists' => 'El horario seleccionado no existe',
            'class_date.required' => 'La fecha de clase es obligatoria',
            'class_date.date' => 'La fecha debe ser válida',
            'status.required' => 'El estado de asistencia es obligatorio',
            'status.in' => 'El estado debe ser: presente, ausente, tarde o justificado',
            'notes.max' => 'Las notas no pueden exceder 500 caracteres',
        ]);

        $validated['recorded_by'] = auth()->id();

        $attendance = Attendance::create($validated);

        return redirect()->back()
            ->with('success', 'Asistencia registrada exitosamente');
    }

    /**
     * Update an attendance record
     */
    public function update(Request $request, Attendance $attendance)
    {
        $validated = $request->validate([
            'status' => 'required|in:present,absent,late,excused',
            'notes' => 'nullable|string|max:500',
        ], [
            'status.required' => 'El estado de asistencia es obligatorio',
            'status.in' => 'El estado debe ser: presente, ausente, tarde o justificado',
            'notes.max' => 'Las notas no pueden exceder 500 caracteres',
        ]);

        $attendance->update($validated);

        return redirect()->back()
            ->with('success', 'Asistencia actualizada exitosamente');
    }

    /**
     * Delete an attendance record
     */
    public function destroy(Attendance $attendance)
    {
        $attendance->delete();

        return redirect()->back()
            ->with('success', 'Registro de asistencia eliminado exitosamente');
    }

    /**
     * Mark attendance for multiple students
     */
    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'class_date' => 'required|date',
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:users,id',
            'attendances.*.status' => 'required|in:present,absent,late,excused',
            'attendances.*.notes' => 'nullable|string|max:500',
        ]);

        $recordedBy = auth()->id();

        foreach ($validated['attendances'] as $attendanceData) {
            Attendance::create([
                'student_id' => $attendanceData['student_id'],
                'schedule_id' => $validated['schedule_id'],
                'class_date' => $validated['class_date'],
                'status' => $attendanceData['status'],
                'notes' => $attendanceData['notes'] ?? null,
                'recorded_by' => $recordedBy,
            ]);
        }

        return redirect()->back()
            ->with('success', 'Asistencias registradas exitosamente');
    }

    /**
     * Get students with attendance alerts
     */
    private function getStudentAlerts()
    {
        $alerts = [];
        $twoWeeksAgo = Carbon::now()->subWeeks(2);

        // Find students with consecutive absences
        $studentsWithAbsences = Attendance::where('status', 'absent')
            ->where('class_date', '>=', $twoWeeksAgo)
            ->with('student', 'schedule.academicProgram', 'schedule.professor')
            ->get()
            ->groupBy('student_id');

        foreach ($studentsWithAbsences as $studentId => $absences) {
            if ($absences->count() >= 3) {
                $student = $absences->first()->student;
                $schedule = $absences->first()->schedule;

                $alerts[] = [
                    'id' => $studentId . '_absences',
                    'estudiante' => [
                        'nombre' => $student->name,
                        'clase' => ($schedule?->academicProgram?->name ?? 'Clase') . ' - ' . ($schedule?->professor?->name ?? 'N/A'),
                        'avatar' => null,
                    ],
                    'tipo' => 'critico',
                    'mensaje' => $absences->count() . ' ausencias en las últimas 2 semanas',
                    'acciones' => ['contactar', 'historial'],
                ];
            }
        }

        // Find students with frequent late arrivals
        $studentsWithLateArrivals = Attendance::where('status', 'late')
            ->where('class_date', '>=', $twoWeeksAgo)
            ->with('student', 'schedule.academicProgram', 'schedule.professor')
            ->get()
            ->groupBy('student_id');

        foreach ($studentsWithLateArrivals as $studentId => $lateArrivals) {
            if ($lateArrivals->count() >= 3) {
                $student = $lateArrivals->first()->student;
                $schedule = $lateArrivals->first()->schedule;

                $alerts[] = [
                    'id' => $studentId . '_late',
                    'estudiante' => [
                        'nombre' => $student->name,
                        'clase' => ($schedule?->academicProgram?->name ?? 'Clase') . ' - ' . ($schedule?->professor?->name ?? 'N/A'),
                        'avatar' => null,
                    ],
                    'tipo' => 'atencion',
                    'mensaje' => 'Patrón de llegar tarde frecuente (' . $lateArrivals->count() . ' veces)',
                    'acciones' => ['padre', 'horario'],
                ];
            }
        }

        return collect($alerts)->take(5)->values();
    }
}