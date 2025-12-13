# 📚 DOCUMENTACIÓN COMPLETA: MÓDULO DE MATRÍCULA KAIROS

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Base de Datos](#base-de-datos)
4. [Backend - Modelos](#backend---modelos)
5. [Backend - Servicios](#backend---servicios)
6. [Backend - Controladores](#backend---controladores)
7. [Backend - Validación](#backend---validación)
8. [Frontend - Componentes y Páginas](#frontend---componentes-y-páginas)
9. [Flujo Completo de Matrícula](#flujo-completo-de-matrícula)
10. [Integración con Wompi](#integración-con-wompi)
11. [Configuración](#configuración)
12. [Ejemplos de Uso](#ejemplos-de-uso)

---

## 🎯 Visión General

El módulo de matrícula de KAIROS es un sistema completo de inscripción pública para Academia Linaje (academia de música). Permite:

- **Inscripción de adultos** (auto-inscripción)
- **Inscripción de menores** (padre/madre inscribe a 1-10 hijos)
- **Procesamiento de pagos** vía Wompi (tarjetas de crédito/débito)
- **Pagos recurrentes automáticos** (mensualidades)
- **Checkout individual o múltiple** (para varios estudiantes)
- **Confirmación y notificaciones** por email

### Características Principales

✅ Formulario multi-paso con validación en tiempo real
✅ Integración completa con pasarela Wompi
✅ Tokenización de tarjetas para pagos automáticos
✅ Soporte para múltiples estudiantes simultáneos
✅ Flujo de checkout optimizado para UX
✅ Webhooks para actualización automática de pagos
✅ Gestión de roles (Estudiante, Padre/Madre)
✅ Auditoría completa con Spatie Activity Log

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    MÓDULO DE MATRÍCULA                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌─────────────────┐
│   Frontend   │─────→│   Backend    │─────→│   Base de Datos │
│  React/TSX   │      │  Laravel 12  │      │   MySQL/Posgres │
└──────────────┘      └──────────────┘      └─────────────────┘
       │                      │                       │
       │              ┌───────┴────────┐             │
       │              │                │             │
       │         ┌────▼────┐     ┌────▼────┐        │
       │         │ Services│     │ Models  │        │
       │         └─────────┘     └─────────┘        │
       │                                             │
       └─────────────────────┬───────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Wompi Gateway  │
                    │  (Pagos Online) │
                    └─────────────────┘
```

### Componentes Principales

**Backend:**
- `MatriculaController` - Controlador de rutas públicas
- `EnrollmentService` - Lógica de negocio para inscripciones
- `WompiService` - Integración con pasarela de pagos
- `EnrollmentRequest` - Validación de formularios
- Modelos: `Enrollment`, `Payment`, `User`, `AcademicProgram`

**Frontend:**
- `Create.tsx` - Formulario de inscripción multi-paso
- `Checkout.tsx` - Pago individual
- `CheckoutMultiple.tsx` - Pagos múltiples
- `Confirmation.tsx` - Página de confirmación
- `WompiWidget.tsx` - Widget de pasarela Wompi

---

## 💾 Base de Datos

### Tabla: `enrollments` (Inscripciones)

```sql
CREATE TABLE enrollments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    program_id BIGINT NOT NULL,
    enrolled_level INT NULL,
    enrollment_date DATE NOT NULL,
    status ENUM('active', 'waiting', 'withdrawn', 'suspended', 'completed', 'cancelled') DEFAULT 'waiting',
    payment_commitment_signed BOOLEAN DEFAULT FALSE,
    payment_commitment_date TIMESTAMP NULL,
    parental_authorization_signed BOOLEAN DEFAULT FALSE,
    parental_authorization_date TIMESTAMP NULL,
    parent_guardian_name VARCHAR(255) NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES academic_programs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, program_id, status)
);
```

**Estados de inscripción:**
- `waiting` - Esperando pago (estado inicial)
- `active` - Pago completado, inscripción activa
- `withdrawn` - Estudiante se retiró
- `suspended` - Suspendido temporalmente
- `completed` - Programa completado
- `cancelled` - Cancelado

### Tabla: `payments` (Pagos)

```sql
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    program_id BIGINT NULL,
    enrollment_id BIGINT NULL,
    parent_payment_id BIGINT NULL,

    -- Datos del pago
    installment_number INT NULL,
    total_installments INT NULL,
    concept TEXT NOT NULL,
    payment_type ENUM('single', 'installment', 'partial') DEFAULT 'single',
    amount DECIMAL(12, 2) NOT NULL,
    original_amount DECIMAL(12, 2) NULL,
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    remaining_amount DECIMAL(12, 2) NULL,
    due_date DATE NOT NULL,
    payment_date DATE NULL,
    status ENUM('pending', 'completed', 'cancelled', 'overdue') DEFAULT 'pending',
    payment_method VARCHAR(255) NULL,
    reference_number VARCHAR(255) NULL,
    recorded_by BIGINT NULL,
    notes TEXT NULL,

    -- Campos de Wompi
    wompi_reference VARCHAR(255) UNIQUE NULL,
    wompi_transaction_id VARCHAR(255) NULL,

    -- Campos de pagos recurrentes
    card_token VARCHAR(255) NULL,
    payment_source_id VARCHAR(255) NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    last_4_digits VARCHAR(4) NULL,
    card_brand VARCHAR(50) NULL,
    next_charge_date DATE NULL,
    failed_attempts INT DEFAULT 0,

    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES academic_programs(id) ON DELETE SET NULL,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_payment_id) REFERENCES payments(id) ON DELETE SET NULL,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
);
```

**Tipos de pago:**
- `single` - Pago único (matrícula)
- `installment` - Parte de plan de cuotas
- `partial` - Permite abonos parciales

**Estados de pago:**
- `pending` - Pendiente de pago
- `completed` - Pagado completamente
- `cancelled` - Cancelado
- `overdue` - Vencido

### Tabla: `payment_transactions` (Abonos)

```sql
CREATE TABLE payment_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    payment_id BIGINT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    transaction_date TIMESTAMP NOT NULL,
    payment_method VARCHAR(255) NOT NULL,
    reference_number VARCHAR(255) NULL,
    recorded_by BIGINT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### Tabla: `parent_guardians` (Acudientes)

```sql
CREATE TABLE parent_guardians (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    parent_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    relationship VARCHAR(255) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Relaciones entre Tablas

```
User (Estudiante)
  │
  ├──→ Enrollment (inscripciones del estudiante)
  │     └──→ AcademicProgram (programa inscrito)
  │
  ├──→ Payment (pagos del estudiante)
  │     ├──→ PaymentTransaction (abonos)
  │     └──→ Enrollment (inscripción relacionada)
  │
  └──→ ParentGuardian (relación padre-hijo)
        └──→ User (padre/madre)
```

---

## 🔧 Backend - Modelos

### Modelo: `Enrollment`

**Ubicación:** `app/Models/Enrollment.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Enrollment extends Model
{
    use LogsActivity;

    protected $fillable = [
        'student_id',
        'program_id',
        'enrolled_level',
        'enrollment_date',
        'status',
        'payment_commitment_signed',
        'payment_commitment_date',
        'parental_authorization_signed',
        'parental_authorization_date',
        'parent_guardian_name',
    ];

    protected $casts = [
        'enrollment_date' => 'date',
        'payment_commitment_signed' => 'boolean',
        'payment_commitment_date' => 'datetime',
        'parental_authorization_signed' => 'boolean',
        'parental_authorization_date' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'student_id',
                'program_id',
                'enrolled_level',
                'enrollment_date',
                'status',
                'payment_commitment_signed',
                'parental_authorization_signed',
            ])
            ->logOnlyDirty()
            ->useLogName('enrollments');
    }

    // Relación con el estudiante
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    // Relación con el programa académico
    public function program(): BelongsTo
    {
        return $this->belongsTo(AcademicProgram::class, 'program_id');
    }

    // Verificar si la inscripción está activa
    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
```

**Características:**
- ✅ Auditoría automática (Spatie Activity Log)
- ✅ Relación con estudiante y programa
- ✅ Estado de inscripción configurable
- ✅ Autorizaciones firmadas (digitales)

### Modelo: `Payment`

**Ubicación:** `app/Models/Payment.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Payment extends Model
{
    use LogsActivity;

    protected $fillable = [
        'student_id',
        'program_id',
        'enrollment_id',
        'parent_payment_id',
        'installment_number',
        'total_installments',
        'concept',
        'payment_type',
        'amount',
        'original_amount',
        'paid_amount',
        'remaining_amount',
        'due_date',
        'payment_date',
        'status',
        'payment_method',
        'reference_number',
        'recorded_by',
        'notes',
        'wompi_reference',
        'wompi_transaction_id',
        'card_token',
        'payment_source_id',
        'is_recurring',
        'last_4_digits',
        'card_brand',
        'next_charge_date',
        'failed_attempts',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'original_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'due_date' => 'date',
        'payment_date' => 'date',
    ];

    // Relaciones
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(AcademicProgram::class, 'program_id');
    }

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function parentPayment(): BelongsTo
    {
        return $this->belongsTo(Payment::class, 'parent_payment_id');
    }

    public function installments()
    {
        return $this->hasMany(Payment::class, 'parent_payment_id');
    }

    public function transactions()
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    /**
     * Marcar pago como completado
     */
    public function markAsPaid(string $paymentMethod, ?string $referenceNumber = null): void
    {
        $this->update([
            'status' => 'completed',
            'payment_date' => now(),
            'payment_method' => $paymentMethod,
            'reference_number' => $referenceNumber,
            'paid_amount' => $this->amount,
            'remaining_amount' => 0,
        ]);
    }

    /**
     * Registrar un abono parcial
     */
    public function addTransaction(float $amount, string $paymentMethod, ?string $referenceNumber = null, ?string $notes = null): PaymentTransaction
    {
        $transaction = $this->transactions()->create([
            'amount' => $amount,
            'transaction_date' => now(),
            'payment_method' => $paymentMethod,
            'reference_number' => $referenceNumber,
            'recorded_by' => auth()->id(),
            'notes' => $notes,
        ]);

        $newPaidAmount = $this->paid_amount + $amount;
        $newRemainingAmount = ($this->original_amount ?? $this->amount) - $newPaidAmount;

        $this->update([
            'paid_amount' => $newPaidAmount,
            'remaining_amount' => max(0, $newRemainingAmount),
            'status' => $newRemainingAmount <= 0 ? 'completed' : 'pending',
            'payment_date' => $newRemainingAmount <= 0 ? now() : $this->payment_date,
        ]);

        return $transaction;
    }

    /**
     * Crear plan de cuotas
     */
    public static function createInstallmentPlan(
        int $studentId,
        ?int $programId,
        ?int $enrollmentId,
        string $concept,
        float $totalAmount,
        int $numberOfInstallments,
        string $startDate
    ): array {
        $installmentAmount = round($totalAmount / $numberOfInstallments, 2);
        $installments = [];

        for ($i = 1; $i <= $numberOfInstallments; $i++) {
            $dueDate = \Carbon\Carbon::parse($startDate)->addMonths($i - 1)->day(5);

            $installments[] = self::create([
                'student_id' => $studentId,
                'program_id' => $programId,
                'enrollment_id' => $enrollmentId,
                'installment_number' => $i,
                'total_installments' => $numberOfInstallments,
                'concept' => $concept . " - Cuota {$i}/{$numberOfInstallments}",
                'payment_type' => 'installment',
                'amount' => $i === $numberOfInstallments
                    ? $totalAmount - ($installmentAmount * ($numberOfInstallments - 1))
                    : $installmentAmount,
                'original_amount' => $installmentAmount,
                'paid_amount' => 0,
                'remaining_amount' => $installmentAmount,
                'due_date' => $dueDate,
                'status' => 'pending',
                'recorded_by' => auth()->id(),
            ]);
        }

        return $installments;
    }

    // Métodos helper
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isInstallment(): bool
    {
        return $this->payment_type === 'installment';
    }

    public function allowsPartialPayments(): bool
    {
        return $this->payment_type === 'partial';
    }

    public function isFullyPaid(): bool
    {
        return $this->remaining_amount <= 0 && $this->status === 'completed';
    }

    public function getPendingBalance(): float
    {
        return max(0, ($this->remaining_amount ?? $this->amount - $this->paid_amount));
    }
}
```

**Funcionalidades:**
- ✅ Pagos únicos, por cuotas o parciales
- ✅ Tokenización de tarjetas (pagos recurrentes)
- ✅ Abonos con historial de transacciones
- ✅ Generación automática de planes de cuotas
- ✅ Integración Wompi (referencias únicas)

---

## ⚙️ Backend - Servicios

### Servicio: `EnrollmentService`

**Ubicación:** `app/Services/EnrollmentService.php`

**Propósito:** Encapsula toda la lógica de negocio para crear inscripciones, usuarios y pagos.

```php
<?php

namespace App\Services;

use App\Models\User;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\PaymentSetting;
use App\Models\ParentGuardian;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class EnrollmentService
{
    /**
     * Crear usuario responsable
     */
    public function createResponsible(array $data): User
    {
        return User::create([
            'name' => $data['name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'document_type' => $data['document_type'],
            'document_number' => $data['document_number'],
            'birth_place' => $data['birth_place'] ?? null,
            'birth_date' => $data['birth_date'],
            'gender' => $data['gender'],
            'address' => $data['address'],
            'neighborhood' => $data['neighborhood'] ?? null,
            'phone' => $data['phone'] ?? null,
            'mobile' => $data['mobile'],
            'city' => $data['city'],
            'department' => $data['department'],
        ]);
    }

    /**
     * Crear usuario estudiante
     */
    public function createStudent(array $data): User
    {
        return User::create([
            'name' => $data['name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'] ?? null,
            'password' => Hash::make('temporal123'), // Temporal
            'document_type' => $data['document_type'],
            'document_number' => $data['document_number'],
            'birth_place' => $data['birth_place'] ?? null,
            'birth_date' => $data['birth_date'],
            'gender' => $data['gender'],
        ]);
    }

    /**
     * Crear inscripción
     */
    public function createEnrollment(User $student, int $programId): Enrollment
    {
        return Enrollment::create([
            'student_id' => $student->id,
            'program_id' => $programId,
            'enrollment_date' => Carbon::today(),
            'status' => 'waiting',
        ]);
    }

    /**
     * Obtener monto de pago configurado
     */
    public function getPaymentAmount(): float
    {
        $paymentSetting = PaymentSetting::where('is_active', true)->first();
        $amount = $paymentSetting ? (float) $paymentSetting->monthly_amount : 100000;

        // Validar mínimo de Wompi (1,500 COP)
        return max($amount, 1500);
    }

    /**
     * Crear pago de matrícula
     */
    public function createPayment(
        User $student,
        int $programId,
        int $enrollmentId,
        string $programName
    ): Payment {
        $amount = $this->getPaymentAmount();

        return Payment::create([
            'student_id' => $student->id,
            'program_id' => $programId,
            'enrollment_id' => $enrollmentId,
            'concept' => "Matrícula {$programName} - {$student->name}",
            'payment_type' => 'single',
            'amount' => $amount,
            'original_amount' => $amount,
            'paid_amount' => 0,
            'remaining_amount' => $amount,
            'due_date' => Carbon::today(),
            'status' => 'pending',
            'wompi_reference' => "MAT-{$enrollmentId}-" . time(),
        ]);
    }

    /**
     * Vincular padre/madre con estudiante
     */
    public function linkParent(User $parent, User $student, string $relationship): void
    {
        ParentGuardian::create([
            'parent_id' => $parent->id,
            'student_id' => $student->id,
            'relationship' => $relationship,
        ]);
    }

    /**
     * Asignar rol a usuario
     */
    public function assignRole(User $user, string $role): void
    {
        if (!\Spatie\Permission\Models\Role::where('name', $role)->exists()) {
            \Spatie\Permission\Models\Role::create(['name' => $role]);
        }
        $user->assignRole($role);
    }

    /**
     * Procesar matrícula de adulto
     */
    public function processAdultEnrollment(array $data): array
    {
        return DB::transaction(function () use ($data) {
            // 1. Crear usuario responsable (que también es el estudiante)
            $responsible = $this->createResponsible($data['responsable']);

            // 2. Asignar rol de estudiante
            $this->assignRole($responsible, 'Estudiante');

            // 3. Crear inscripción
            $enrollment = $this->createEnrollment(
                $responsible,
                $data['responsable']['program_id']
            );

            // 4. Crear pago
            $programName = \App\Models\AcademicProgram::find($data['responsable']['program_id'])->name;
            $payment = $this->createPayment(
                $responsible,
                $data['responsable']['program_id'],
                $enrollment->id,
                $programName
            );

            return [
                'payments' => [$payment],
                'responsible' => $responsible,
            ];
        });
    }

    /**
     * Procesar matrícula de menores
     */
    public function processMinorEnrollment(array $data): array
    {
        return DB::transaction(function () use ($data) {
            // 1. Crear usuario responsable (padre/madre)
            $responsible = $this->createResponsible($data['responsable']);

            // 2. Asignar rol de padre/madre
            $this->assignRole($responsible, 'Padre/Madre');

            $payments = [];

            // 3. Procesar cada estudiante
            foreach ($data['estudiantes'] as $estudianteData) {
                // Crear usuario estudiante
                $student = $this->createStudent($estudianteData);

                // Asignar rol
                $this->assignRole($student, 'Estudiante');

                // Vincular con responsable
                $this->linkParent($responsible, $student, 'Padre/Madre');

                // Crear inscripción
                $enrollment = $this->createEnrollment(
                    $student,
                    $estudianteData['program_id']
                );

                // Crear pago
                $programName = \App\Models\AcademicProgram::find($estudianteData['program_id'])->name;
                $payment = $this->createPayment(
                    $student,
                    $estudianteData['program_id'],
                    $enrollment->id,
                    $programName
                );

                $payments[] = $payment;
            }

            return [
                'payments' => $payments,
                'responsible' => $responsible,
            ];
        });
    }
}
```

**Métodos principales:**

1. **`processAdultEnrollment()`** - Inscripción de adulto
   - Crea usuario con credenciales
   - Asigna rol "Estudiante"
   - Crea inscripción en estado `waiting`
   - Genera pago con referencia Wompi

2. **`processMinorEnrollment()`** - Inscripción de menores
   - Crea responsable (padre/madre)
   - Por cada hijo: crea usuario, vincula, crea inscripción y pago
   - Retorna array de pagos para checkout múltiple

---

### Servicio: `WompiService`

**Ubicación:** `app/Services/WompiService.php`

**Propósito:** Maneja toda la integración con la pasarela de pagos Wompi.

```php
<?php

namespace App\Services;

use App\Models\WompiSetting;

class WompiService
{
    /**
     * Obtener configuración activa de Wompi
     */
    public function getActiveConfig(): array
    {
        $wompiSetting = WompiSetting::where('is_active', true)->first();

        return [
            'public_key' => $wompiSetting?->public_key ?? config('wompi.public_key'),
            'integrity_secret' => $wompiSetting?->integrity_secret ?? config('wompi.integrity_secret'),
        ];
    }

    /**
     * Verificar si está en modo test
     */
    public function isTestMode(string $publicKey): bool
    {
        return str_starts_with($publicKey, 'pub_test_');
    }

    /**
     * Generar firma de integridad
     */
    public function generateIntegritySignature(
        string $reference,
        int $amountInCents,
        string $currency,
        string $integritySecret
    ): string {
        $integrityString = $reference . $amountInCents . $currency . $integritySecret;
        return hash('sha256', $integrityString);
    }

    /**
     * Preparar datos para checkout
     */
    public function prepareCheckoutData(
        string $wompiReference,
        float $amount,
        ?string $publicKey = null,
        ?string $integritySecret = null
    ): array {
        if (!$publicKey || !$integritySecret) {
            $config = $this->getActiveConfig();
            $publicKey = $config['public_key'];
            $integritySecret = $config['integrity_secret'];
        }

        $amountInCents = (int) ($amount * 100);
        $currency = 'COP';

        // Solo generar firma si NO es modo test
        $integritySignature = null;
        if (!$this->isTestMode($publicKey)) {
            $integritySignature = $this->generateIntegritySignature(
                $wompiReference,
                $amountInCents,
                $currency,
                $integritySecret
            );

            \Log::info('Wompi Integrity Signature (Producción)', [
                'reference' => $wompiReference,
                'amount' => $amountInCents,
                'currency' => $currency,
                'signature' => $integritySignature,
            ]);
        } else {
            \Log::info('Wompi modo TEST - Sin firma de integridad', [
                'reference' => $wompiReference,
                'amount' => $amountInCents,
                'currency' => $currency,
            ]);
        }

        return [
            'wompiPublicKey' => $publicKey,
            'amountInCents' => $amountInCents,
            'integritySignature' => $integritySignature,
            'redirectUrl' => config('wompi.redirect_url'),
        ];
    }
}
```

**Características clave:**

1. **Modo Test vs Producción:**
   - **Test:** Claves `pub_test_*` → NO requiere firma de integridad
   - **Producción:** Claves `pub_prod_*` → REQUIERE firma SHA256

2. **Firma de Integridad:**
   ```
   SHA256(reference + amountInCents + currency + integritySecret)
   ```

---

## 🎮 Backend - Controladores

### Controlador: `MatriculaController`

**Ubicación:** `app/Http/Controllers/MatriculaController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\AcademicProgram;
use App\Models\Payment;
use App\Http\Requests\EnrollmentRequest;
use App\Services\EnrollmentService;
use App\Services\WompiService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MatriculaController extends Controller
{
    public function __construct(
        protected EnrollmentService $enrollmentService,
        protected WompiService $wompiService
    ) {}

    /**
     * Mostrar el formulario de matrícula pública
     */
    public function create()
    {
        $programs = AcademicProgram::where('status', 'active')
            ->with(['schedules' => function ($query) {
                $query->where('status', 'active')
                    ->with('professor:id,name')
                    ->select('id', 'academic_program_id', 'days_of_week', 'start_time', 'end_time', 'professor_id', 'max_students', 'status');
            }])
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        // Agregar información de cupos disponibles
        $programs->each(function ($program) {
            $program->schedules->each(function ($schedule) {
                $enrolledCount = $schedule->enrollments()->where('status', 'enrolled')->count();
                $schedule->enrolled_count = $enrolledCount;
                $schedule->available_slots = $schedule->max_students - $enrolledCount;
                $schedule->has_capacity = $schedule->available_slots > 0;
            });
        });

        // Filtrar solo programas que tienen horarios
        $programs = $programs->filter(fn($program) => $program->schedules->count() > 0)->values();

        return Inertia::render('Matricula/Create', [
            'programs' => $programs,
        ]);
    }

    /**
     * Procesar el formulario de matrícula
     */
    public function store(EnrollmentRequest $request)
    {
        \Log::info('Datos de matrícula recibidos:', $request->validated());

        try {
            // Procesar según el tipo de matrícula
            $result = $request->is_minor
                ? $this->enrollmentService->processMinorEnrollment($request->validated())
                : $this->enrollmentService->processAdultEnrollment($request->validated());

            $payments = $result['payments'];
            $responsible = $result['responsible'];

            // Redirigir al checkout
            return $this->redirectToCheckout($payments);

        } catch (\Exception $e) {
            \Log::error('Error al procesar matrícula:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            flash_error('Ocurrió un error al procesar la matrícula. Por favor intenta nuevamente.');
            return redirect()->back()->withInput();
        }
    }

    /**
     * Redirigir al checkout apropiado
     */
    protected function redirectToCheckout(array $payments)
    {
        if (count($payments) === 1) {
            return redirect()->route('matricula.checkout', ['payment' => $payments[0]->id]);
        }

        $paymentIds = collect($payments)->pluck('id')->implode(',');
        return redirect()->route('matricula.checkout.multiple', ['payments' => $paymentIds]);
    }

    /**
     * Mostrar página de checkout para múltiples pagos
     */
    public function checkoutMultiple(Request $request)
    {
        $paymentIds = array_filter(
            explode(',', $request->query('payments', '')),
            'is_numeric'
        );

        if (empty($paymentIds)) {
            flash_error('No se encontraron pagos para procesar.');
            return redirect()->route('home');
        }

        $payments = Payment::with(['student', 'program', 'enrollment'])
            ->whereIn('id', $paymentIds)
            ->where('status', 'pending')
            ->get();

        if ($payments->isEmpty()) {
            flash_error('No se encontraron pagos pendientes.');
            return redirect()->route('home');
        }

        $config = $this->wompiService->getActiveConfig();

        // Preparar datos para cada pago
        $paymentsData = $payments->map(function ($payment) use ($config) {
            $checkoutData = $this->wompiService->prepareCheckoutData(
                $payment->wompi_reference,
                $payment->amount,
                $config['public_key'],
                $config['integrity_secret']
            );

            return array_merge([
                'id' => $payment->id,
                'concept' => $payment->concept,
                'amount' => $payment->amount,
                'wompi_reference' => $payment->wompi_reference,
                'student' => $payment->student,
                'program' => $payment->program,
            ], $checkoutData);
        });

        return Inertia::render('Matricula/CheckoutMultiple', [
            'payments' => $paymentsData,
            'totalAmount' => $payments->sum('amount'),
            'wompiPublicKey' => $config['public_key'],
            'redirectUrl' => config('wompi.redirect_url'),
        ]);
    }

    /**
     * Mostrar página de checkout individual
     */
    public function checkout($paymentId)
    {
        $payment = Payment::with(['student', 'program', 'enrollment'])
            ->findOrFail($paymentId);

        if ($payment->status !== 'pending') {
            flash_error('Este pago ya ha sido procesado.');
            return redirect()->route('home');
        }

        $checkoutData = $this->wompiService->prepareCheckoutData(
            $payment->wompi_reference,
            $payment->amount
        );

        return Inertia::render('Matricula/Checkout', array_merge(
            ['payment' => $payment],
            $checkoutData
        ));
    }

    /**
     * Página de confirmación después del pago
     */
    public function confirmation(Request $request)
    {
        $paymentId = $request->query('id');

        if (!$paymentId) {
            flash_error('No se encontró información del pago.');
            return redirect()->route('home');
        }

        $payment = Payment::with(['student', 'program'])
            ->find($paymentId);

        if (!$payment) {
            flash_error('No se encontró el pago especificado.');
            return redirect()->route('home');
        }

        return Inertia::render('Matricula/Confirmation', [
            'payment' => $payment,
        ]);
    }
}
```

**Rutas:**

```php
// routes/web.php
Route::prefix('matricula')->group(function () {
    Route::get('/', [MatriculaController::class, 'create'])->name('matricula.create');
    Route::post('/', [MatriculaController::class, 'store'])->name('matricula.store');
    Route::get('/checkout/{payment}', [MatriculaController::class, 'checkout'])->name('matricula.checkout');
    Route::get('/checkout-multiple', [MatriculaController::class, 'checkoutMultiple'])->name('matricula.checkout.multiple');
    Route::get('/confirmacion', [MatriculaController::class, 'confirmation'])->name('matricula.confirmation');
});
```

---

## ✅ Backend - Validación

### FormRequest: `EnrollmentRequest`

**Ubicación:** `app/Http/Requests/EnrollmentRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // ===== RESPONSABLE =====
            'responsable.name' => ['required', 'string', 'max:255'],
            'responsable.last_name' => ['required', 'string', 'max:255'],
            'responsable.email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'responsable.password' => ['required', 'string', 'min:8', 'confirmed'],
            'responsable.document_type' => ['required', Rule::in(['TI', 'CC', 'CE', 'Pasaporte'])],
            'responsable.document_number' => ['required', 'string', 'max:50', 'unique:users,document_number'],
            'responsable.birth_date' => ['required', 'date', 'before:today'],
            'responsable.gender' => ['required', Rule::in(['M', 'F'])],
            'responsable.address' => ['required', 'string'],
            'responsable.mobile' => ['required', 'string', 'max:20'],
            'responsable.city' => ['required', 'string', 'max:255'],
            'responsable.department' => ['required', 'string', 'max:255'],

            // ===== TIPO DE MATRÍCULA =====
            'is_minor' => ['required', 'boolean'],

            // ===== DATOS MUSICALES (solo si es adulto) =====
            'responsable.plays_instrument' => ['required_if:is_minor,false', 'boolean'],
            'responsable.desired_instrument' => ['required_if:is_minor,false', 'string', 'max:255'],
            'responsable.modality' => ['required_if:is_minor,false', Rule::in(['Linaje Kids', 'Linaje Teens', 'Linaje Big'])],
            'responsable.current_level' => ['required_if:is_minor,false', 'integer', 'min:1', 'max:10'],
            'responsable.program_id' => ['required_if:is_minor,false', 'exists:academic_programs,id'],
            'responsable.schedule_id' => ['nullable', 'exists:schedules,id'],

            // ===== ESTUDIANTES (solo si es menor) =====
            'estudiantes' => ['required_if:is_minor,true', 'array', 'min:1', 'max:10'],
            'estudiantes.*.name' => ['required', 'string', 'max:255'],
            'estudiantes.*.last_name' => ['required', 'string', 'max:255'],
            'estudiantes.*.email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'estudiantes.*.document_number' => ['required', 'string', 'max:50', 'unique:users,document_number'],
            'estudiantes.*.birth_date' => ['required', 'date', 'before:today'],
            'estudiantes.*.gender' => ['required', Rule::in(['M', 'F'])],
            'estudiantes.*.datos_musicales.desired_instrument' => ['required', 'string', 'max:255'],
            'estudiantes.*.datos_musicales.modality' => ['required', Rule::in(['Linaje Kids', 'Linaje Teens', 'Linaje Big'])],
            'estudiantes.*.program_id' => ['required', 'exists:academic_programs,id'],

            // ===== AUTORIZACIONES =====
            'payment_commitment' => ['required', 'accepted'],
            'parental_authorization' => [
                function ($attribute, $value, $fail) {
                    if ($this->input('is_minor') == true && $value !== true) {
                        $fail('Debe aceptar la autorización parental para menores de edad.');
                    }
                },
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'responsable.name.required' => 'El nombre del responsable es obligatorio',
            'responsable.email.unique' => 'Este correo electrónico ya está registrado',
            'responsable.password.min' => 'La contraseña debe tener al menos 8 caracteres',
            'responsable.password.confirmed' => 'Las contraseñas no coinciden',
            'responsable.document_number.unique' => 'Este número de documento ya está registrado',
            'estudiantes.required_if' => 'Debe agregar al menos un estudiante',
            'estudiantes.max' => 'No puede agregar más de 10 estudiantes',
            'payment_commitment.accepted' => 'Debe aceptar el compromiso de pago',
        ];
    }
}
```

---

## 🎨 Frontend - Componentes y Páginas

### Componente: `WompiWidget.tsx`

**Ubicación:** `resources/js/components/WompiWidget.tsx`

```typescript
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

interface WompiWidgetProps {
    publicKey: string;
    amountInCents: number;
    reference: string;
    currency?: string;
    redirectUrl: string;
    customerEmail: string;
    customerName: string;
    integritySignature?: string | null;
}

export default function WompiWidget({
    publicKey,
    amountInCents,
    reference,
    currency = 'COP',
    redirectUrl,
    customerEmail,
    customerName,
    integritySignature = null,
}: WompiWidgetProps) {
    const [loading, setLoading] = useState(true);
    const [showManualButton, setShowManualButton] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        loadWompiWidget();
        return () => cleanupWidget();
    }, []);

    const validateEmail = (email: string): string => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.warn('Email inválido detectado:', email);
            return 'noreply@academialinaje.com';
        }
        return email;
    };

    const loadWompiWidget = () => {
        const script = document.createElement('script');
        script.src = 'https://checkout.wompi.co/widget.js';
        script.async = true;

        // Configurar atributos del widget
        script.setAttribute('data-render', 'button');
        script.setAttribute('data-public-key', publicKey);
        script.setAttribute('data-currency', currency);
        script.setAttribute('data-amount-in-cents', amountInCents.toString());
        script.setAttribute('data-reference', reference);
        script.setAttribute('data-redirect-url', redirectUrl);
        script.setAttribute('data-customer-data:email', validateEmail(customerEmail));
        script.setAttribute('data-customer-data:full-name', customerName);

        // Solo agregar firma si existe (modo producción)
        if (integritySignature) {
            script.setAttribute('data-signature:integrity', integritySignature);
        }

        script.setAttribute('data-acceptance-token', 'true');
        script.setAttribute('data-payment-methods-enabled', 'CARD');

        script.onload = handleScriptLoad;
        script.onerror = handleScriptError;

        const container = document.getElementById('wompi-widget');
        container?.appendChild(script);
    };

    const handleScriptLoad = () => {
        setLoading(false);

        // Intentar auto-abrir después de un delay
        setTimeout(() => {
            const wompiButton = findWompiButton();
            if (wompiButton) {
                wompiButton.click();
            } else {
                setShowManualButton(true);
            }
        }, 1000);

        // Mostrar botón manual después de 3 segundos
        setTimeout(() => setShowManualButton(true), 3000);
    };

    const handleScriptError = () => {
        setLoading(false);
        setErrorMessage('No se pudo cargar la pasarela de pago. Por favor recarga la página.');
    };

    const findWompiButton = (): HTMLButtonElement | null => {
        return document.querySelector('form[action*="checkout.wompi"] button');
    };

    const handleManualClick = () => {
        const wompiButton = findWompiButton();
        if (wompiButton) {
            wompiButton.click();
        } else {
            setErrorMessage('No se encontró el botón de pago. Por favor recarga la página.');
        }
    };

    const cleanupWidget = () => {
        const container = document.getElementById('wompi-widget');
        const script = container?.querySelector('script');
        if (script && container) {
            container.removeChild(script);
        }
    };

    return (
        <div>
            {errorMessage && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                </div>
            )}

            <div id="wompi-widget" className="flex flex-col items-center gap-4">
                {loading && (
                    <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Cargando pasarela de pago...</span>
                    </div>
                )}

                {showManualButton && !errorMessage && (
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-3">
                            El formulario de pago no se abrió automáticamente.
                        </p>
                        <Button onClick={handleManualClick}>
                            Abrir Formulario de Pago
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
```

---

## 🔄 Flujo Completo de Matrícula

### Diagrama de Flujo Detallado

```
1. USUARIO ACCEDE → GET /matricula
   ↓
2. MatriculaController@create
   - Carga programas activos con horarios
   - Calcula cupos disponibles
   ↓
3. Renderiza Create.tsx (formulario multi-paso)
   ↓
4. USUARIO COMPLETA 4 PASOS:
   - Paso 1: Datos personales del responsable
   - Paso 2: Ubicación + selección is_minor
   - Paso 3: Datos musicales (adulto o estudiantes)
   - Paso 4: Autorizaciones
   ↓
5. POST /matricula (EnrollmentRequest valida)
   ↓
6. MatriculaController@store
   ↓
7. EnrollmentService procesa:

   SI is_minor = false (ADULTO):
   - Crea User responsable
   - Rol: Estudiante
   - Crea Enrollment (status: waiting)
   - Crea Payment (status: pending, wompi_reference)

   SI is_minor = true (MENORES):
   - Crea User responsable (Padre/Madre)
   - POR CADA HIJO:
     - Crea User hijo (Estudiante)
     - ParentGuardian link
     - Enrollment (waiting)
     - Payment (pending)
   ↓
8. REDIRIGE A CHECKOUT:
   - 1 pago → /matricula/checkout/{id}
   - N pagos → /matricula/checkout-multiple?payments=1,2,3
   ↓
9. PÁGINA DE CHECKOUT
   - Carga WompiWidget
   - Auto-abre modal de pago
   ↓
10. USUARIO PAGA EN WOMPI
    - Ingresa datos de tarjeta
    - Wompi tokeniza tarjeta
    - Procesa transacción
    ↓
11. WOMPI REDIRIGE
    → /matricula/confirmacion?id={payment_id}
    ↓
12. Confirmation.tsx muestra estado
    ↓
13. WEBHOOK ASÍNCRONO
    POST /webhook/wompi (desde Wompi)
    - Valida firma
    - Busca pago por wompi_reference
    - SI APPROVED:
      - Payment.status = completed
      - Enrollment.status = active
      - Guarda card_token para recurrentes
      - Envía email confirmación
    ↓
14. ✅ MATRÍCULA COMPLETADA
```

---

## 🔗 Integración con Wompi

### Configuración de Wompi

**Variables de entorno (.env):**

```env
WOMPI_PUBLIC_KEY=pub_test_xxxxxxxxxxxxx
WOMPI_PRIVATE_KEY=prv_test_xxxxxxxxxxxxx
WOMPI_EVENTS_SECRET=test_events_xxxxxxxxxxxxx
WOMPI_INTEGRITY_SECRET=test_integrity_xxxxxxxxxxxxx
WOMPI_URL=https://sandbox.wompi.co/v1
```

### Diferencias: Modo Test vs Producción

| Aspecto | Modo Test | Modo Producción |
|---------|-----------|-----------------|
| **Clave Pública** | `pub_test_*` | `pub_prod_*` |
| **Firma de Integridad** | ❌ NO requerida | ✅ REQUERIDA |
| **Tarjetas** | Test cards | Tarjetas reales |
| **Transacciones** | Simuladas | Reales con cargos |
| **URL API** | `https://sandbox.wompi.co/v1` | `https://production.wompi.co/v1` |

### Generar Firma de Integridad

```php
// Fórmula:
SHA256(reference + amountInCents + currency + integritySecret)

// Ejemplo:
// reference = "MAT-123-1670000000"
// amountInCents = 100000
// currency = "COP"
// integritySecret = "prod_integrity_abc123"
//
// integrityString = "MAT-123-1670000000100000COPprod_integrity_abc123"
// signature = SHA256(integrityString)
```

### Estructura del Widget

```html
<script
  src="https://checkout.wompi.co/widget.js"
  data-render="button"
  data-public-key="pub_test_xxxxx"
  data-currency="COP"
  data-amount-in-cents="100000"
  data-reference="MAT-123-1670000000"
  data-redirect-url="https://app.com/matricula/confirmacion"
  data-customer-data:email="estudiante@mail.com"
  data-customer-data:full-name="Juan Pérez"
  data-signature:integrity="a1b2c3..." <!-- Solo en producción -->
  data-acceptance-token="true"
  data-payment-methods-enabled="CARD"
></script>
```

### Webhook de Wompi

**Evento recibido:**

```json
{
  "event": "transaction.updated",
  "data": {
    "transaction": {
      "id": "12345-wompi-transaction-id",
      "reference": "MAT-123-1670000000",
      "status": "APPROVED",
      "amount_in_cents": 100000,
      "payment_method": {
        "token": "tok_card_xxx",
        "last_four": "4242",
        "brand": "VISA"
      }
    }
  }
}
```

**Procesamiento:**

```php
public function wompiWebhook(Request $request)
{
    // 1. Validar firma
    // 2. Buscar pago por wompi_reference
    // 3. Actualizar según status:

    if ($status === 'APPROVED') {
        DB::transaction(function () use ($payment, $transaction) {
            // Marcar pago como completado
            $payment->update([
                'status' => 'completed',
                'payment_date' => now(),
                'card_token' => $transaction['payment_method']['token'],
                'last_4_digits' => $transaction['payment_method']['last_four'],
                'is_recurring' => true,
                'next_charge_date' => now()->addMonth()->day(5),
            ]);

            // Activar inscripción
            $payment->enrollment->update(['status' => 'active']);

            // Enviar email
            Mail::to($payment->student->email)->send(new EnrollmentConfirmed($payment));
        });
    }
}
```

---

## ⚙️ Configuración

### 1. Configurar Wompi

```env
# Test
WOMPI_PUBLIC_KEY=pub_test_xxxxxxxxxxxxxx
WOMPI_PRIVATE_KEY=prv_test_xxxxxxxxxxxxxx
WOMPI_EVENTS_SECRET=test_events_xxxxxx
WOMPI_INTEGRITY_SECRET=test_integrity_xxxx
WOMPI_URL=https://sandbox.wompi.co/v1

# Producción
WOMPI_PUBLIC_KEY=pub_prod_xxxxxxxxxxxxxx
WOMPI_PRIVATE_KEY=prv_prod_xxxxxxxxxxxxxx
WOMPI_EVENTS_SECRET=prod_events_xxxxxx
WOMPI_INTEGRITY_SECRET=prod_integrity_xxxx
WOMPI_URL=https://production.wompi.co/v1
```

### 2. Configurar Webhook en Wompi

Dashboard Wompi → Configuración → Webhooks:

- **URL:** `https://tuapp.com/webhook/wompi`
- **Eventos:** `transaction.updated`
- **Secret:** Copiar a `WOMPI_EVENTS_SECRET`

### 3. Configurar PaymentSetting

```php
PaymentSetting::create([
    'monthly_amount' => 100000, // COP
    'is_active' => true,
]);
```

### 4. Configurar Roles

```bash
php artisan db:seed --class=RolePermissionSeeder
```

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Inscripción de Adulto

**Usuario:** Juan Pérez, 25 años, quiere estudiar Piano.

**Flujo:**

1. Accede a `/matricula`
2. Completa datos personales
3. Selecciona `is_minor = false`
4. Ingresa experiencia musical
5. Selecciona programa "Piano Clásico"
6. Acepta compromiso de pago
7. Submit → Se crea:
   - User (Juan, rol: Estudiante)
   - Enrollment (status: waiting)
   - Payment (status: pending)
8. Paga en Wompi
9. Webhook actualiza → Enrollment activo
10. Email de confirmación

### Ejemplo 2: Inscripción de Menores (3 hijos)

**Usuario:** María González inscribe a Ana, Carlos y Sofía.

**Flujo:**

1. Completa datos de María (responsable)
2. Selecciona `is_minor = true`
3. Agrega 3 estudiantes con sus programas
4. Submit → Se crea:
   - User María (Padre/Madre)
   - 3 Users estudiantes
   - 3 ParentGuardian links
   - 3 Enrollments (waiting)
   - 3 Payments (pending)
5. Checkout múltiple
6. Paga secuencialmente los 3
7. Webhooks actualizan cada inscripción
8. Email de confirmación

---

## 🎯 Resumen

### ✅ Características del Sistema

- Formulario multi-paso con validación
- Inscripción de adultos y menores (1-10)
- Integración completa con Wompi
- Tokenización de tarjetas
- Pagos recurrentes automáticos
- Checkout individual y múltiple
- Webhooks para actualización automática
- Gestión de roles y permisos
- Auditoría completa
- Abonos parciales (preparado)
- Planes de cuotas (preparado)

### 🔒 Seguridad

- Validación exhaustiva
- Firma de integridad en producción
- Validación de webhooks
- Email y documento únicos
- Passwords hasheados
- Transacciones de BD

---

**Documentación generada:** Diciembre 2024
**Versión del sistema:** KAIROS 1.0
**Stack:** Laravel 12 + React 19 + Wompi
