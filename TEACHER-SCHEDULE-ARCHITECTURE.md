# Teacher & Schedule Assignment Architecture - KAIROS

## ✅ Your Current Architecture (Recommended Design)

Your system is **already correctly designed**! The teacher assignment happens at the **Schedule** level, not at the Program level.

---

## 📊 Data Model Overview

```
┌─────────────────────┐
│  AcademicProgram    │  (What: Piano, Guitar, etc.)
│  - name             │
│  - description      │
│  - duration_months  │
└──────────┬──────────┘
           │ has many
           ▼
┌─────────────────────┐
│     Schedule        │  (When & Who)
│  - program_id       │  → Which program
│  - professor_id     │  → Who teaches ✅
│  - days_of_week     │  → When (lunes,miércoles)
│  - start_time       │  → Start time
│  - end_time         │  → End time
│  - classroom        │  → Where
│  - max_students     │  → Capacity
└──────────┬──────────┘
           │ has many
           ▼
┌─────────────────────┐
│ ScheduleEnrollment  │  (Student Registration)
│  - schedule_id      │
│  - student_id       │
│  - enrollment_date  │
│  - status           │
│  - final_grade      │
└─────────────────────┘
```

---

## 🎯 Why This Design Is Perfect

### ✅ Advantages

1. **Flexibility**: One teacher can teach multiple schedules
   ```
   Teacher: Juan
   ├── Piano - Schedule A (Mon/Wed 9:00-10:00)
   ├── Guitar - Schedule C (Mon/Wed 11:00-12:00)
   └── Piano - Schedule D (Sat 10:00-12:00)
   ```

2. **Multiple Sections**: Same program, different teachers
   ```
   Piano Program
   ├── Schedule A (Mon/Wed) → Teacher: Juan
   ├── Schedule B (Tue/Thu) → Teacher: María
   └── Schedule C (Sat) → Teacher: Pedro
   ```

3. **Conflict Detection**: Built-in method to check schedule conflicts
   ```php
   $schedule->hasConflictWith($otherSchedule);
   ```

4. **Real-world Mapping**: Matches how educational institutions actually work

---

## 🔄 Complete Workflow

### Step 1: Create Academic Program
```php
// Admin creates a program (e.g., "Piano Básico")
AcademicProgram::create([
    'name' => 'Piano Básico',
    'description' => 'Curso introductorio de piano',
    'duration_months' => 6,
    'status' => 'active'
]);
```

### Step 2: Create Schedule & Assign Teacher
```php
// Admin creates a schedule for the program and assigns teacher
Schedule::create([
    'academic_program_id' => 1,           // Piano Básico
    'professor_id' => 5,                  // Teacher: Juan Pérez ✅
    'name' => 'Piano Básico - Grupo A',
    'days_of_week' => 'lunes,miércoles',  // Days
    'start_time' => '09:00',
    'end_time' => '10:30',
    'classroom' => 'Sala 101',
    'semester' => '2025-1',
    'max_students' => 15,
    'status' => 'active'
]);
```

### Step 3: Students Enroll in Schedule
```php
// Student enrolls in the specific schedule
ScheduleEnrollment::create([
    'schedule_id' => 1,      // Piano Básico - Grupo A (taught by Juan)
    'student_id' => 20,      // Student: María González
    'enrollment_date' => now(),
    'status' => 'enrolled'
]);
```

---

## 💡 Common Use Cases

### Use Case 1: Teacher Teaching Multiple Programs

```php
// Juan teaches Piano on Monday/Wednesday and Guitar on Tuesday/Thursday
Schedule::create([
    'academic_program_id' => 1,  // Piano
    'professor_id' => 5,          // Juan
    'days_of_week' => 'lunes,miércoles',
    'start_time' => '09:00',
    'end_time' => '10:30',
]);

Schedule::create([
    'academic_program_id' => 2,  // Guitar
    'professor_id' => 5,          // Juan (same teacher)
    'days_of_week' => 'martes,jueves',
    'start_time' => '09:00',
    'end_time' => '10:30',
]);
```

### Use Case 2: Multiple Teachers for Same Program

```php
// Piano program with 3 different sections and teachers
$pianoProgram = AcademicProgram::find(1);

// Section A - Morning - Teacher: Juan
Schedule::create([
    'academic_program_id' => $pianoProgram->id,
    'professor_id' => 5,  // Juan
    'name' => 'Piano Básico - Grupo A',
    'days_of_week' => 'lunes,miércoles',
    'start_time' => '09:00',
]);

// Section B - Afternoon - Teacher: María
Schedule::create([
    'academic_program_id' => $pianoProgram->id,
    'professor_id' => 8,  // María
    'name' => 'Piano Básico - Grupo B',
    'days_of_week' => 'martes,jueves',
    'start_time' => '14:00',
]);

// Section C - Weekend - Teacher: Pedro
Schedule::create([
    'academic_program_id' => $pianoProgram->id,
    'professor_id' => 12, // Pedro
    'name' => 'Piano Básico - Grupo C',
    'days_of_week' => 'sábado',
    'start_time' => '10:00',
]);
```

### Use Case 3: Checking Teacher Availability

```php
// Get all schedules for a specific teacher
$teacherSchedules = Schedule::where('professor_id', $teacherId)
    ->where('status', 'active')
    ->get();

// Check if teacher has a conflict with new schedule
$newSchedule = new Schedule([
    'days_of_week' => 'lunes,miércoles',
    'start_time' => '09:00',
    'end_time' => '10:30',
]);

$hasConflict = $teacherSchedules->contains(function ($existingSchedule) use ($newSchedule) {
    return $newSchedule->hasConflictWith($existingSchedule);
});

if ($hasConflict) {
    return back()->withErrors(['schedule' => 'El profesor ya tiene otro horario en ese tiempo']);
}
```

---

## 🖥️ UI/UX Recommendations

### Create/Edit Schedule Form

```tsx
// Schedules/Create.tsx or Schedules/Edit.tsx
interface ScheduleFormProps {
    programs: AcademicProgram[];
    professors: User[];  // Users with role "Profesor"
}

function ScheduleForm({ programs, professors }: ScheduleFormProps) {
    const { data, setData, post } = useForm({
        academic_program_id: '',
        professor_id: '',        // ✅ Teacher selection
        name: '',
        days_of_week: [],
        start_time: '',
        end_time: '',
        classroom: '',
        max_students: 15,
    });

    return (
        <form onSubmit={handleSubmit}>
            {/* Program Selection */}
            <Select
                label="Programa Académico"
                value={data.academic_program_id}
                onChange={(e) => setData('academic_program_id', e.target.value)}
            >
                {programs.map(program => (
                    <option key={program.id} value={program.id}>
                        {program.name}
                    </option>
                ))}
            </Select>

            {/* Teacher Selection ✅ */}
            <Select
                label="Profesor Asignado"
                value={data.professor_id}
                onChange={(e) => setData('professor_id', e.target.value)}
            >
                <option value="">Sin asignar</option>
                {professors.map(prof => (
                    <option key={prof.id} value={prof.id}>
                        {prof.name}
                    </option>
                ))}
            </Select>

            {/* Days of Week */}
            <CheckboxGroup
                label="Días de la semana"
                options={['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']}
                value={data.days_of_week}
                onChange={(days) => setData('days_of_week', days)}
            />

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
                <Input
                    type="time"
                    label="Hora de inicio"
                    value={data.start_time}
                    onChange={(e) => setData('start_time', e.target.value)}
                />
                <Input
                    type="time"
                    label="Hora de fin"
                    value={data.end_time}
                    onChange={(e) => setData('end_time', e.target.value)}
                />
            </div>

            {/* Classroom & Capacity */}
            <Input
                label="Aula/Salón"
                value={data.classroom}
                onChange={(e) => setData('classroom', e.target.value)}
            />

            <Input
                type="number"
                label="Cupo máximo"
                value={data.max_students}
                onChange={(e) => setData('max_students', e.target.value)}
            />
        </form>
    );
}
```

### Schedule List View

```tsx
function ScheduleCard({ schedule }: { schedule: Schedule }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{schedule.name}</CardTitle>
                <Badge>{schedule.academicProgram.name}</Badge>
            </CardHeader>
            <CardContent>
                {/* Teacher Info ✅ */}
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">
                        {schedule.professor?.name || 'Sin profesor asignado'}
                    </span>
                </div>

                {/* Schedule Info */}
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{schedule.days_of_week}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{schedule.start_time} - {schedule.end_time}</span>
                </div>

                {/* Enrollment Info */}
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                        {schedule.enrolled_count} / {schedule.max_students} estudiantes
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
```

---

## 📋 Controller Examples (Already Implemented!)

Your `ScheduleController` already handles this correctly:

### Loading Professors for Form
```php
// ScheduleController@create (Line 61-63)
$professors = User::role('Profesor')
    ->orderBy('name')
    ->get(['id', 'name', 'email']);
```

### Validation (Line 75)
```php
'professor_id' => ['nullable', 'exists:users,id'],  // ✅ Optional
```

### Creating Schedule with Teacher
```php
Schedule::create($validated);  // Includes professor_id
```

---

## 🔍 Querying Schedules

### Get All Schedules with Teacher Info
```php
$schedules = Schedule::with(['academicProgram', 'professor'])
    ->latest()
    ->get();
```

### Get Teacher's Schedule
```php
$teacherSchedules = Schedule::where('professor_id', $teacherId)
    ->with('academicProgram')
    ->where('status', 'active')
    ->get();
```

### Get Schedules Without Teacher (Needs Assignment)
```php
$unassignedSchedules = Schedule::whereNull('professor_id')
    ->where('status', 'active')
    ->with('academicProgram')
    ->get();
```

### Get Students in Teacher's Classes
```php
$teacher = User::find($teacherId);
$students = User::role('Estudiante')
    ->whereHas('scheduleEnrollments', function ($query) use ($teacher) {
        $query->whereHas('schedule', function ($q) use ($teacher) {
            $q->where('professor_id', $teacher->id);
        });
    })
    ->get();
```

---

## 🎓 Business Rules & Validation

### Built-in Validations

Your `Schedule` model already includes:

1. **Time Validation** (Line 65-67)
   ```php
   if ($schedule->start_time >= $schedule->end_time) {
       throw new \InvalidArgumentException('La hora de inicio debe ser anterior a la hora de fin');
   }
   ```

2. **Days Validation** (Line 70-76)
   ```php
   $days = explode(',', $schedule->days_of_week);
   foreach ($days as $day) {
       if (!in_array(trim($day), self::VALID_DAYS)) {
           throw new \InvalidArgumentException("Día inválido: {$day}");
       }
   }
   ```

3. **Conflict Detection** (Line 223-244)
   ```php
   public function hasConflictWith(Schedule $other): bool
   ```

### Recommended Additional Validations

Add to your controller's `store()` and `update()` methods:

```php
public function store(Request $request)
{
    $validated = $request->validate([
        // ... existing validation
    ]);

    // ✅ Check teacher availability (no conflicts)
    if ($validated['professor_id']) {
        $existingSchedules = Schedule::where('professor_id', $validated['professor_id'])
            ->where('status', 'active')
            ->where('id', '!=', $request->schedule_id ?? null)  // Exclude current when editing
            ->get();

        $newSchedule = new Schedule($validated);

        foreach ($existingSchedules as $existing) {
            if ($newSchedule->hasConflictWith($existing)) {
                return back()->withErrors([
                    'schedule' => "El profesor ya tiene otro horario en ese tiempo: {$existing->name}"
                ])->withInput();
            }
        }
    }

    Schedule::create($validated);

    flash_success('Horario creado exitosamente');
    return redirect()->route('horarios.index');
}
```

---

## 📊 Reports & Analytics

### Teacher Workload Report
```php
public function teacherWorkloadReport()
{
    $teachers = User::role('Profesor')
        ->withCount('schedules')
        ->with(['schedules' => function ($query) {
            $query->where('status', 'active')
                ->withCount('activeStudents');
        }])
        ->get()
        ->map(function ($teacher) {
            return [
                'name' => $teacher->name,
                'total_schedules' => $teacher->schedules_count,
                'total_students' => $teacher->schedules->sum('active_students_count'),
                'total_hours_per_week' => $teacher->schedules->sum(function ($schedule) {
                    return $schedule->getDurationInMinutes() * count($schedule->getDaysArray()) / 60;
                }),
            ];
        });

    return Inertia::render('Reports/TeacherWorkload', [
        'teachers' => $teachers
    ]);
}
```

---

## ✅ Summary: Your Design Is Correct!

### What You Have (✅ Correct):
- ✅ Teacher assigned to **Schedule** (not Program)
- ✅ Flexible: One teacher → multiple schedules
- ✅ Flexible: One program → multiple schedules with different teachers
- ✅ Built-in conflict detection
- ✅ Proper relationships in models
- ✅ Database constraints

### What You DON'T Need:
- ❌ Don't assign teacher to Program directly
- ❌ Don't create separate "TeacherAssignment" table
- ❌ Don't duplicate teacher info

---

## 🚀 Next Steps

1. **UI Implementation**:
   - Add teacher dropdown to Schedule create/edit forms
   - Show teacher info in schedule cards
   - Create teacher workload dashboard

2. **Enhancements** (Optional):
   - Email notifications to teachers when assigned
   - Teacher availability calendar view
   - Student-teacher messaging
   - Teacher evaluation by students

3. **Reports**:
   - Teacher workload report
   - Teacher-student ratio analytics
   - Schedule conflict report

---

**Your architecture is perfect! Just keep using it as designed.** 🎉
