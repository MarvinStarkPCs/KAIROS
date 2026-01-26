<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Schedule;
use App\Models\AcademicProgram;
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
    public function index(Request $request)
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        // Filtros
        $search = $request->input('search');
        $status = $request->input('status');
        $programId = $request->input('program_id');
        $professorId = $request->input('professor_id');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

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

        // Get today's attendance records for stats
        $todayAttendances = Attendance::whereDate('class_date', $today)->get();

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

        // Build query for all attendances with filters
        $attendancesQuery = Attendance::with(['student', 'schedule.professor', 'schedule.academicProgram', 'recordedBy'])
            ->orderBy('class_date', 'desc')
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($search) {
            $attendancesQuery->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($status && $status !== 'all') {
            $attendancesQuery->where('status', $status);
        }

        if ($programId && $programId !== 'all') {
            $attendancesQuery->whereHas('schedule.academicProgram', function ($q) use ($programId) {
                $q->where('id', $programId);
            });
        }

        if ($professorId && $professorId !== 'all') {
            $attendancesQuery->whereHas('schedule', function ($q) use ($professorId) {
                $q->where('professor_id', $professorId);
            });
        }

        if ($dateFrom) {
            $attendancesQuery->whereDate('class_date', '>=', $dateFrom);
        }

        if ($dateTo) {
            $attendancesQuery->whereDate('class_date', '<=', $dateTo);
        }

        // Paginate results
        $attendancesPaginated = $attendancesQuery->paginate(20)->withQueryString();

        // Format attendance records for display
        $asistencias = $attendancesPaginated->getCollection()->map(function ($attendance) {
            $status = match($attendance->status) {
                'present' => 'presente',
                'absent' => 'ausente',
                'late' => 'tardanza',
                'excused' => 'justificado',
                default => 'presente'
            };

            return [
                'id' => $attendance->id,
                'fecha' => $attendance->class_date->format('Y-m-d'),
                'fecha_formato' => $attendance->class_date->format('d/m/Y'),
                'hora' => $attendance->schedule?->start_time ?? 'N/A',
                'estudiante' => [
                    'id' => $attendance->student->id,
                    'nombre' => $attendance->student->name,
                    'email' => $attendance->student->email,
                    'avatar' => null,
                ],
                'programa' => [
                    'id' => $attendance->schedule?->academicProgram?->id,
                    'nombre' => $attendance->schedule?->academicProgram?->name ?? 'Sin programa',
                    'color' => $attendance->schedule?->academicProgram?->color ?? '#7a9b3c',
                ],
                'profesor' => [
                    'id' => $attendance->schedule?->professor?->id,
                    'nombre' => $attendance->schedule?->professor?->name ?? 'N/A',
                    'avatar' => null,
                ],
                'estado' => $status,
                'estado_original' => $attendance->status,
                'notas' => $attendance->notes,
                'registrado_por' => $attendance->recordedBy?->name ?? 'Sistema',
                'created_at' => $attendance->created_at->format('d/m/Y H:i'),
            ];
        });

        // Replace collection in paginator
        $attendancesPaginated->setCollection($asistencias);

        // Find students with attendance issues
        $alertas = $this->getStudentAlerts();

        // Get programs and professors for filters
        $programs = AcademicProgram::where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);

        $professors = User::role('Profesor')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Assists/Index', [
            'asistenciaHoy' => [
                'total' => $totalStudentsToday,
                'presentes' => $presentToday,
                'porcentaje' => $percentageToday,
            ],
            'ausencias' => $absentToday,
            'tardanzas' => $lateToday,
            'promedioMensual' => $monthlyAverage,
            'asistencias' => $attendancesPaginated,
            'alertas' => $alertas,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'program_id' => $programId,
                'professor_id' => $professorId,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
            'programs' => $programs,
            'professors' => $professors,
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