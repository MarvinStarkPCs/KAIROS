# Análisis del Módulo de Horarios - KAIROS

**Fecha:** 2025-10-30
**Estado:** Parcialmente implementado - Requiere completar backend y frontend

---

## 📊 Estado Actual

### ✅ Base de Datos (Completa)

**Migraciones:**
1. **`2025_10_29_145049_create_schedules_table.php`**
   - Tabla principal de horarios
   - Campos: programa académico, profesor, nombre, descripción
   - Horarios: días de semana, hora inicio/fin
   - Información adicional: aula, semestre, cupo máximo
   - Estado: active/inactive/completed

2. **`2025_10_29_145319_create_schedule_enrollments_table.php`**
   - Inscripciones de estudiantes a horarios
   - Relación: student_id + schedule_id (unique)
   - Campos: fecha inscripción, estado, calificación final, notas
   - Estados: enrolled/dropped/completed

**Modelos:**
1. **`Schedule.php`** (Completo ✅)
   - Relaciones: academicProgram, professor, enrollments, students, attendances
   - Métodos útiles: hasAvailableSlots(), availableSlots()
   - LogsActivity para auditoría

2. **`ScheduleEnrollment.php`** (Completo ✅)
   - Relaciones: student, schedule
   - Métodos: isActive(), isCompleted(), isDropped()
   - LogsActivity para auditoría

---

## ❌ Backend (Casi vacío - Requiere implementación completa)

**Archivo:** `app/Http/Controllers/Schedules.php`

**Estado actual:**
```php
public function index() {
    return Inertia::render('Schedules/Index');
}
```

**Problemas:**
- ❌ No tiene CRUD completo (create, store, edit, update, destroy)
- ❌ No consulta datos de la base de datos
- ❌ No valida datos
- ❌ No maneja relaciones (profesores, programas, estudiantes)
- ❌ No implementa lógica de inscripciones
- ❌ No verifica cupos disponibles

---

## ⚠️ Frontend (Vista bonita pero desconectada)

**Archivo:** `resources/js/pages/Schedules/Index.tsx`

**Lo que tiene (✅):**
- Interfaz visual atractiva tipo calendario semanal
- Filtros: profesor, instrumento, tipo de clase, fecha
- Botones de acción: Nueva Clase, Duplicar Semana, Vista Semanal
- Sección de reagendamiento de clases
- Estadísticas de ocupación por día
- Diseño responsive

**Problemas (❌):**
- ❌ Todos los datos son hardcodeados (ejemplo de academia de música)
- ❌ No recibe props del backend
- ❌ No usa AppLayout (debe usarlo para consistencia)
- ❌ No tiene alertas automáticas
- ❌ No tiene formularios para crear/editar
- ❌ No conecta con el backend real

---

## 📋 Estructura de Datos Requerida

### Schedule (Horario)
```typescript
{
    id: number;
    academic_program_id: number;
    academic_program: {
        id: number;
        name: string;
    };
    professor_id: number | null;
    professor: {
        id: number;
        name: string;
        email: string;
    } | null;
    name: string;                    // "Matemáticas - Grupo A"
    description: string | null;
    days_of_week: string;            // "lunes,miércoles,viernes"
    start_time: string;              // "09:00"
    end_time: string;                // "11:00"
    classroom: string | null;        // "Aula 101"
    semester: string | null;         // "2025-1"
    max_students: number;
    status: 'active' | 'inactive' | 'completed';
    enrolled_count: number;          // Estudiantes inscritos actualmente
    available_slots: number;         // Cupos disponibles
    created_at: string;
    updated_at: string;
}
```

### ScheduleEnrollment (Inscripción)
```typescript
{
    id: number;
    student_id: number;
    student: {
        id: number;
        name: string;
        email: string;
    };
    schedule_id: number;
    enrollment_date: string;
    status: 'enrolled' | 'dropped' | 'completed';
    final_grade: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}
```

---

## 🎯 Plan de Implementación

### Fase 1: Backend Completo

#### 1.1 Controller - ScheduleController.php
- ✅ Renombrar `Schedules.php` → `ScheduleController.php` (convención Laravel)
- ✅ Implementar métodos CRUD:
  - `index()` - Lista de horarios con filtros
  - `create()` - Formulario crear
  - `store()` - Guardar nuevo horario
  - `show($id)` - Ver detalle + estudiantes inscritos
  - `edit($id)` - Formulario editar
  - `update($id)` - Actualizar horario
  - `destroy($id)` - Eliminar (validar que no tenga estudiantes)

#### 1.2 Rutas (routes/web.php)
```php
Route::resource('horarios', ScheduleController::class);
Route::post('horarios/{schedule}/enroll', [ScheduleController::class, 'enrollStudent']);
Route::delete('horarios/{schedule}/unenroll/{student}', [ScheduleController::class, 'unenrollStudent']);
```

#### 1.3 Validaciones
- Horarios no se solapen para el mismo profesor
- Cupo máximo respetado
- Días de semana válidos
- Horas de inicio < horas fin

---

### Fase 2: Frontend Actualizado

#### 2.1 Página Index
- Usar AppLayout
- Recibir datos reales del backend
- Tabla/Grid con horarios reales
- Filtros funcionales
- Acciones: Ver, Editar, Eliminar

#### 2.2 Formulario Create/Edit
- Selección de programa académico
- Selección de profesor (opcional)
- Días de semana (checkboxes)
- Horas (time pickers)
- Aula, semestre, cupo máximo

#### 2.3 Página Show (Detalle)
- Información del horario
- Lista de estudiantes inscritos
- Botón para inscribir/desinscribir estudiantes
- Estadísticas de asistencia

---

## 🚀 Funcionalidades Propuestas

### Esenciales (MVP)
1. ✅ CRUD completo de horarios
2. ✅ Asignación de profesor
3. ✅ Inscripción de estudiantes
4. ✅ Validación de cupos
5. ✅ Filtros por programa, profesor, estado

### Avanzadas (Futuro)
1. ⏳ Vista de calendario semanal interactiva
2. ⏳ Detección automática de conflictos de horario
3. ⏳ Duplicar horarios de semestres anteriores
4. ⏳ Reagendamiento de clases
5. ⏳ Notificaciones por email a estudiantes
6. ⏳ Integración con asistencias

---

## 📝 Mensajes Flash Recomendados

```php
// Crear
'Horario creado exitosamente'

// Actualizar
'Horario actualizado exitosamente'

// Eliminar
'Horario eliminado exitosamente'
'No se puede eliminar el horario porque tiene estudiantes inscritos'

// Inscribir estudiante
'Estudiante inscrito exitosamente'
'No hay cupos disponibles en este horario'
'El estudiante ya está inscrito en este horario'

// Desinscribir estudiante
'Estudiante desinscrito exitosamente'
```

---

## 🔗 Dependencias con Otros Módulos

- **Programas Académicos**: Horario pertenece a un programa
- **Usuarios**: Profesores y estudiantes son usuarios
- **Asistencias**: Los horarios generan registros de asistencia
- **Pagos**: Pueden estar vinculados a inscripciones en horarios

---

## 📁 Archivos a Crear/Modificar

### Backend
- ✏️ `app/Http/Controllers/ScheduleController.php` (renombrar y completar)
- ✏️ `routes/web.php` (agregar rutas)
- ✏️ `app/Http/Requests/StoreScheduleRequest.php` (nuevo)
- ✏️ `app/Http/Requests/UpdateScheduleRequest.php` (nuevo)

### Frontend
- ✏️ `resources/js/pages/Schedules/Index.tsx` (refactorizar)
- ➕ `resources/js/pages/Schedules/Create.tsx` (nuevo)
- ➕ `resources/js/pages/Schedules/Edit.tsx` (nuevo)
- ➕ `resources/js/pages/Schedules/Show.tsx` (nuevo)

---

**Prioridad:** ALTA
**Complejidad:** MEDIA
**Tiempo estimado:** 4-6 horas

