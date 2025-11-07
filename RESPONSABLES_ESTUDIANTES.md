# Sistema de Responsables y Estudiantes

## Problema

La academia tiene diferentes tipos de usuarios estudiantes:

1. **Estudiantes adultos independientes** - Personas mayores que gestionan todo ellos mismos (inscripciones, pagos, acceso al sistema)
2. **Estudiantes menores/dependientes** - Niños que tienen un responsable (padre/madre) que gestiona sus inscripciones y pagos
3. **Responsables** - Padres que gestionan las inscripciones de uno o varios hijos (y pueden ser estudiantes también)

El sistema actual trata a todos los usuarios por igual, sin distinguir entre responsables y dependientes.

## Opciones Evaluadas

### Opción 1: Relación Jerárquica Parent-Child ✅ (SELECCIONADA)

Agregar campo `parent_id` a la tabla `users` para crear relación padre-hijo.

**Ventajas:**
- Sencilla de implementar
- Mantiene un solo modelo User
- El responsable puede iniciar sesión y ver/gestionar todos sus hijos
- Flexible: un padre puede tener múltiples hijos
- Los estudiantes también pueden ser padres
- `parent_id = NULL` indica usuario independiente

**Desventajas:**
- Ninguna significativa

### Opción 2: Tabla Separada de Responsables

Crear tabla `guardians` separada con relación many-to-many a `users`.

**Ventajas:**
- Separación clara entre responsables y usuarios
- Un estudiante puede tener múltiples responsables
- Más información específica del responsable

**Desventajas:**
- Más compleja de implementar
- Requiere más tablas y relaciones
- Los responsables necesitarían credenciales separadas

### Opción 3: Campos de Contacto en User

Agregar campos `contact_*` a la tabla users.

**Ventajas:**
- Muy simple de implementar

**Desventajas:**
- El responsable NO puede iniciar sesión
- No maneja múltiples hijos
- Datos duplicados si un padre tiene varios hijos

## Solución Seleccionada: Opción 1

### Estructura de Base de Datos

```sql
users
├── id
├── name
├── email (nullable para menores sin acceso)
├── password (nullable para menores sin acceso)
├── parent_id (nullable) -> foreign key a users.id
├── phone
├── document_type (enum: 'CC', 'TI', 'CE', 'Pasaporte')
├── document_number
├── birth_date
├── address
└── ...
```

### Roles del Sistema

- **Estudiante**: Persona que toma clases
- **Responsable**: Persona que gestiona dependientes
- **Profesor**: Docente de la academia
- **Admin**: Administrador del sistema

**Nota**: Un usuario puede tener múltiples roles (ej: Estudiante + Responsable)

## Casos de Uso

### 1. Estudiante Adulto Independiente

```php
User {
  id: 1
  name: "Juan Pérez"
  email: "juan@email.com"
  password: "hashed_password"
  parent_id: NULL  // Sin responsable
  roles: ["Estudiante"]
}
```

**Comportamiento:**
- Gestiona sus propias inscripciones
- Realiza sus propios pagos
- Inicia sesión y ve solo su información
- Dashboard muestra: mis inscripciones, horarios, pagos

### 2. Estudiante Menor con Responsable

```php
User {
  id: 2
  name: "María García"
  email: null  // Opcional, puede no tener
  password: null  // No necesita acceso al sistema
  parent_id: 3  // Apunta a su responsable
  birth_date: "2015-05-10"
  roles: ["Estudiante"]
}
```

**Comportamiento:**
- Su responsable gestiona sus inscripciones
- Los pagos se asocian al estudiante pero los realiza el responsable
- NO puede iniciar sesión (no tiene credenciales)
- Aparece en el dashboard del responsable

### 3. Responsable (Padre/Madre)

```php
User {
  id: 3
  name: "Ana García"
  email: "ana@email.com"
  password: "hashed_password"
  parent_id: NULL
  roles: ["Responsable"]
}

// Dependientes
User { id: 2, parent_id: 3 }  // María
User { id: 4, parent_id: 3 }  // Pedro
```

**Comportamiento:**
- Inicia sesión y ve dashboard con todos sus dependientes
- Gestiona inscripciones de sus hijos
- Realiza pagos por sus hijos
- Dashboard muestra: tarjetas de cada dependiente con sus inscripciones, pagos, etc.

### 4. Responsable que TAMBIÉN es Estudiante

```php
User {
  id: 5
  name: "Carlos López"
  email: "carlos@email.com"
  parent_id: NULL
  roles: ["Estudiante", "Responsable"]
}

// Dependientes
User { id: 6, parent_id: 5 }  // Su hijo
```

**Comportamiento:**
- Estudia en la academia (sus propias inscripciones)
- Tiene hijos estudiando también
- Dashboard muestra DOS secciones:
  - Mi información (inscripciones, horarios, pagos propios)
  - Mis dependientes (información de sus hijos)

## Implementación Técnica

### 1. Migración

```php
// Nueva migración: add_parent_and_personal_fields_to_users_table.php

public function up(): void
{
    Schema::table('users', function (Blueprint $table) {
        // Relación con responsable
        $table->foreignId('parent_id')
            ->nullable()
            ->after('id')
            ->constrained('users')
            ->nullOnDelete();

        // Información personal
        $table->string('phone', 20)->nullable()->after('email');
        $table->enum('document_type', ['CC', 'TI', 'CE', 'Pasaporte'])
            ->nullable()
            ->after('phone');
        $table->string('document_number', 50)->nullable()->after('document_type');
        $table->date('birth_date')->nullable()->after('document_number');
        $table->text('address')->nullable()->after('birth_date');

        // Email y password pueden ser null para menores
        $table->string('email')->nullable()->change();
    });
}
```

### 2. Modelo User - Relaciones

```php
class User extends Authenticatable
{
    // Relación con el responsable (padre/madre)
    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    // Relación con los dependientes (hijos)
    public function dependents(): HasMany
    {
        return $this->hasMany(User::class, 'parent_id');
    }

    // Verificar si tiene responsable
    public function hasParent(): bool
    {
        return !is_null($this->parent_id);
    }

    // Verificar si tiene dependientes
    public function hasDependents(): bool
    {
        return $this->dependents()->exists();
    }

    // Obtener el usuario responsable de facturación
    public function getBillingUser(): User
    {
        return $this->parent ?? $this;
    }

    // Verificar si es menor de edad
    public function isMinor(): bool
    {
        if (!$this->birth_date) {
            return false;
        }

        return $this->birth_date->age < 18;
    }
}
```

### 3. Lógica de Pagos

```php
// PaymentController.php

public function store(Request $request)
{
    $student = User::findOrFail($request->student_id);

    // Obtener quién debe aparecer en la facturación
    $billingUser = $student->getBillingUser();

    $payment = Payment::create([
        'student_id' => $student->id,
        'program_id' => $request->program_id,
        'amount' => $request->amount,
        // ... otros campos
    ]);

    // La factura/recibo mostrará datos de $billingUser
    return $this->generateReceipt($payment, $billingUser);
}
```

### 4. Dashboard Responsivo

```php
// DashboardController.php

public function index()
{
    $user = auth()->user();
    $data = [];

    // Si es estudiante, cargar su información
    if ($user->hasRole('Estudiante')) {
        $data['myEnrollments'] = $user->programEnrollments()
            ->with('program', 'schedules')
            ->get();
        $data['myPayments'] = $user->payments()
            ->latest()
            ->take(5)
            ->get();
    }

    // Si tiene dependientes, cargar información de ellos
    if ($user->hasDependents()) {
        $data['dependents'] = $user->dependents()
            ->with([
                'programEnrollments.program',
                'payments' => fn($q) => $q->latest()->take(3)
            ])
            ->get();
    }

    return Inertia::render('Dashboard', $data);
}
```

### 5. Formulario de Inscripción

```php
// EnrollmentController.php

public function create()
{
    $user = auth()->user();

    // Si es responsable, puede inscribir a sus dependientes
    $availableStudents = [$user]; // Puede inscribirse a sí mismo

    if ($user->hasDependents()) {
        $availableStudents = array_merge(
            $availableStudents,
            $user->dependents->toArray()
        );
    }

    return Inertia::render('Enrollments/Create', [
        'students' => $availableStudents,
        'programs' => AcademicProgram::all(),
    ]);
}
```

### 6. Componente React - Dashboard

```tsx
// Dashboard.tsx

interface Props {
  myEnrollments?: Enrollment[];
  myPayments?: Payment[];
  dependents?: User[];
}

export default function Dashboard({ myEnrollments, myPayments, dependents }: Props) {
  return (
    <div className="space-y-6">
      {/* Mi información (si soy estudiante) */}
      {myEnrollments && (
        <section>
          <h2>Mis Inscripciones</h2>
          {myEnrollments.map(enrollment => (
            <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
          ))}
        </section>
      )}

      {/* Mis dependientes (si soy responsable) */}
      {dependents && dependents.length > 0 && (
        <section>
          <h2>Mis Dependientes</h2>
          {dependents.map(dependent => (
            <DependentCard
              key={dependent.id}
              dependent={dependent}
              enrollments={dependent.enrollments}
              payments={dependent.payments}
            />
          ))}
        </section>
      )}
    </div>
  );
}
```

## Flujos de Trabajo

### Flujo 1: Admin inscribe a un menor

1. Admin accede a "Nueva Inscripción"
2. Busca/crea al estudiante (el niño)
3. Si es menor de edad, el sistema solicita:
   - "¿Tiene responsable registrado?"
   - Si NO: Formulario para crear el responsable
   - Si SÍ: Selector de responsable existente
4. Se crea el estudiante con `parent_id` apuntando al responsable
5. Se crea la inscripción asociada al estudiante
6. Los pagos se generan para el estudiante pero muestran datos del responsable

### Flujo 2: Responsable inscribe a su hijo

1. Responsable inicia sesión
2. Accede a "Nueva Inscripción"
3. Selector muestra:
   - "Yo mismo" (si también es estudiante)
   - "María García (hija)"
   - "Pedro García (hijo)"
   - "Agregar nuevo dependiente"
4. Selecciona al estudiante
5. Completa formulario de inscripción
6. Sistema crea la inscripción y genera pagos

### Flujo 3: Estudiante adulto se auto-inscribe

1. Estudiante inicia sesión
2. Accede a "Nueva Inscripción"
3. Completa formulario
4. Sistema crea inscripción y pagos asociados a él directamente
5. Realiza su propio pago

## Consideraciones de Seguridad

### Políticas de Autorización

```php
// EnrollmentPolicy.php

public function create(User $user): bool
{
    // Admins siempre pueden crear
    if ($user->hasRole('Admin')) {
        return true;
    }

    // Responsables y estudiantes pueden crear sus propias inscripciones
    return $user->hasAnyRole(['Responsable', 'Estudiante']);
}

public function update(User $user, Enrollment $enrollment): bool
{
    // Puede editar si es:
    // 1. Admin
    // 2. El estudiante inscrito
    // 3. El responsable del estudiante inscrito

    return $user->hasRole('Admin')
        || $user->id === $enrollment->student_id
        || $user->id === $enrollment->student->parent_id;
}
```

### Validación en Requests

```php
// CreateEnrollmentRequest.php

public function rules(): array
{
    return [
        'student_id' => [
            'required',
            'exists:users,id',
            function ($attribute, $value, $fail) {
                $student = User::find($value);

                // Verificar que el usuario autenticado puede inscribir a este estudiante
                if (auth()->id() !== $value && auth()->id() !== $student->parent_id) {
                    if (!auth()->user()->hasRole('Admin')) {
                        $fail('No tienes permiso para inscribir a este estudiante.');
                    }
                }
            },
        ],
        'program_id' => 'required|exists:academic_programs,id',
    ];
}
```

## Migraciones de Datos Existentes

Si ya hay estudiantes en el sistema:

```php
// Comando artisan: php artisan migrate:parent-relationships

// 1. Todos los usuarios existentes no tienen responsable (son independientes)
User::whereNull('parent_id')->update(['parent_id' => NULL]);

// 2. Identificar menores de edad y solicitar asignación de responsable
// (esto puede requerir intervención manual del admin)

// 3. Asignar rol "Estudiante" a todos los usuarios que tienen inscripciones
User::whereHas('programEnrollments')->each(function ($user) {
    if (!$user->hasRole('Estudiante')) {
        $user->assignRole('Estudiante');
    }
});
```

## Próximos Pasos

1. **Crear migración** para agregar campos a `users`
2. **Actualizar modelo User** con relaciones y métodos auxiliares
3. **Crear/actualizar seeders** para roles "Responsable"
4. **Actualizar controladores** de Enrollment y Payment
5. **Actualizar vistas React** del dashboard
6. **Implementar políticas** de autorización
7. **Crear formulario** de gestión de dependientes
8. **Actualizar generación** de recibos/facturas
9. **Documentar API** y tipos TypeScript
10. **Pruebas** de todos los flujos

## Notas Finales

- Los estudiantes menores NO requieren email/password si no necesitan acceso al sistema
- Un responsable puede ser estudiante simultáneamente
- La facturación siempre muestra datos del responsable cuando existe
- El sistema debe validar permisos en cada operación según la relación parent-child
- Considerar agregar campo `relationship` (padre, madre, abuelo, tutor) si es necesario para reportes
