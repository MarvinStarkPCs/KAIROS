# Módulo de Matrículas - KAIROS

Este documento describe el funcionamiento completo del módulo de matrículas del sistema KAIROS.

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Flujos de Negocio](#flujos-de-negocio)
3. [Backend](#backend)
4. [Frontend](#frontend)
5. [Integración de Pagos (Wompi)](#integración-de-pagos-wompi)
6. [Base de Datos](#base-de-datos)
7. [Validaciones](#validaciones)
8. [Rutas y Endpoints](#rutas-y-endpoints)

---

## Descripción General

El módulo de matrículas permite a usuarios externos (sin autenticación previa) inscribirse en los programas académicos de la institución. Soporta dos tipos principales de matrícula:

- **Matrícula de Adultos:** El responsable es también el estudiante
- **Matrícula de Menores:** El responsable inscribe a uno o más menores de edad

Adicionalmente, permite solicitar **clases demo** sin crear usuarios ni procesar pagos.

---

## Flujos de Negocio

### Matrícula de Adulto

```
1. Usuario ingresa datos personales y credenciales
2. Usuario ingresa datos de ubicación y contacto
3. Usuario selecciona datos musicales, programa y horario
4. Usuario acepta compromiso de pago
5. Sistema crea:
   - User con rol "Estudiante"
   - Enrollment con estado "waiting"
   - Payment pendiente
6. Redirección a checkout de Wompi
7. Usuario realiza pago
8. Webhook de Wompi actualiza estado del pago
9. Email de confirmación al usuario
```

### Matrícula de Menores

```
1. Responsable ingresa sus datos personales y credenciales
2. Responsable ingresa datos de ubicación
3. Responsable selecciona "Es para menores de edad"
4. Responsable agrega 1-10 estudiantes con sus datos
5. Responsable acepta autorización parental y compromiso de pago
6. Sistema crea (en transacción):
   - User responsable con rol "Padre/Madre"
   - Por cada estudiante:
     - User con rol "Estudiante"
     - Vinculación ParentGuardian
     - Enrollment
     - Payment
7. Redirección a checkout múltiple
8. Pago secuencial de cada inscripción
9. Confirmación final
```

### Solicitud de Clase Demo

```
1. Usuario selecciona programa con is_demo = true
2. Usuario completa formulario básico
3. Sistema crea DemoRequest (sin usuarios ni pagos)
4. Redirección a página de confirmación
5. Admin contacta al solicitante posteriormente
```

---

## Backend

### Controladores

#### MatriculaController

Ubicación: `app/Http/Controllers/MatriculaController.php`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `create()` | GET /matricula | Muestra formulario público |
| `store()` | POST /matricula | Procesa envío del formulario |
| `checkout()` | GET /matricula/checkout/{payment} | Página de pago individual |
| `checkoutMultiple()` | GET /matricula/checkout-multiple | Pago de múltiples inscripciones |
| `createPaymentLink()` | POST /matricula/checkout/{payment}/create-payment-link | Crea link de pago en Wompi |
| `confirmation()` | GET /matricula/confirmacion | Confirmación post-pago |
| `demoConfirmation()` | GET /matricula/demo/confirmacion/{request} | Confirmación de solicitud demo |

#### EnrollmentController

Ubicación: `app/Http/Controllers/EnrollmentController.php`

Gestión administrativa de inscripciones (requiere autenticación).

| Método | Descripción |
|--------|-------------|
| `index()` | Lista inscripciones con filtros |
| `create()` | Formulario administrativo |
| `store()` | Crear inscripción manual |
| `show()` | Detalles de inscripción |
| `edit()` / `update()` | Editar inscripción |
| `destroy()` | Eliminar inscripción |
| `quickEnroll()` | Inscripción rápida |
| `changeStatus()` | Cambiar estado |

### Servicios

#### EnrollmentService

Ubicación: `app/Services/EnrollmentService.php`

Lógica de negocio para procesar inscripciones.

```php
// Métodos principales
processAdultEnrollment(array $data): array
processMinorEnrollment(array $data): array

// Métodos auxiliares
createResponsible(array $data, bool $isStudent = false): User
createStudent(array $data): User
createEnrollment(User $student, int $programId): Enrollment
createPayment(...): Payment
linkParent(User $parent, User $student, string $relationship): void
assignRole(User $user, string $role): void
```

#### WompiService

Ubicación: `app/Services/WompiService.php`

Integración con gateway de pagos Wompi.

```php
// Configuración
getActiveConfig(): array
isTestMode(string $publicKey): bool
isPaymentActive(): bool

// Pagos
createPaymentLink(...): array
prepareCheckoutData(...): array

// Validación
generateIntegritySignature(...): string
verifyWebhookSignature(array $event, string $signature): bool
```

### Modelos

#### Enrollment

```php
// Estados disponibles
'active'      // Inscripción activa
'waiting'     // En lista de espera
'withdrawn'   // Retirado
'suspended'   // Suspendido
'completed'   // Completado

// Relaciones
student(): BelongsTo(User)
program(): BelongsTo(AcademicProgram)
```

#### Payment

```php
// Estados
'pending'     // Pendiente de pago
'completed'   // Completado
'cancelled'   // Cancelado
'overdue'     // Vencido

// Campos Wompi
wompi_reference
wompi_transaction_id
card_token
payment_source_id
is_recurring
last_4_digits
card_brand
next_charge_date

// Relaciones
student(): BelongsTo(User)
program(): BelongsTo(AcademicProgram)
enrollment(): BelongsTo(Enrollment)
```

#### DemoRequest

```php
// Estados
'pending'     // Solicitud nueva
'contacted'   // Contactado
'completed'   // Completado

// Campos principales
responsible_name, responsible_email, responsible_phone
is_minor, program_id, schedule_id
students_data (JSON)
```

---

## Frontend

### Páginas

Ubicación: `resources/js/pages/Matricula/`

| Archivo | Descripción |
|---------|-------------|
| `Create.tsx` | Formulario de 4 pasos para matrícula pública |
| `Checkout.tsx` | Página de pago individual con widget Wompi |
| `CheckoutMultiple.tsx` | Pago secuencial de múltiples inscripciones |
| `Confirmation.tsx` | Confirmación post-pago |
| `DemoConfirmation.tsx` | Confirmación de solicitud demo |

### Componentes de Pasos

Ubicación: `resources/js/pages/Matricula/Create/steps/`

| Paso | Componente | Descripción |
|------|------------|-------------|
| 1 | `Step1ResponsableForm.tsx` | Datos personales y credenciales |
| 2 | `Step2LocationForm.tsx` | Ubicación y tipo de matrícula |
| 3a | `Step3AdultMusicalForm.tsx` | Datos musicales (adulto) |
| 3b | `Step3MinorStudentsForm.tsx` | Gestión de menores |
| 4 | `Step4AuthorizationsForm.tsx` | Autorizaciones y compromisos |

### Tipos TypeScript

```typescript
type DocumentType = 'CC' | 'TI' | 'CE' | 'Pasaporte'
type Gender = 'M' | 'F'
type StudyModality = '' | 'Linaje Kids' | 'Linaje Teens' | 'Linaje Big'

interface MatriculaFormData {
    responsable: Responsable
    is_minor: boolean
    estudiantes: Student[]
    parental_authorization: boolean
    payment_commitment: boolean
}
```

---

## Integración de Pagos (Wompi)

### Flujo de Pago

```
1. Crear Payment en DB (estado: pending)
2. Generar wompi_reference (MAT-{enrollmentId}-{timestamp})
3. Preparar checkoutData con firma de integridad
4. Cargar widget de Wompi en frontend
5. Usuario completa pago
6. Wompi envía webhook POST /webhook/wompi
7. Validar firma X-Event-Checksum
8. Actualizar Payment según estado de transacción
9. Enviar email de confirmación
```

### Configuración

Los datos de Wompi se almacenan en la tabla `wompi_settings`:

| Campo | Descripción |
|-------|-------------|
| `environment` | sandbox o production |
| `public_key` | Llave pública (pub_test_* o pub_prod_*) |
| `private_key` | Llave privada |
| `events_secret` | Secret para validar webhooks |
| `integrity_secret` | Secret para firma de integridad |
| `api_url` | URL de la API de Wompi |
| `is_active` | Si está habilitado |

### Firma de Integridad

```php
$integrityString = $reference . $amountInCents . 'COP' . $integritySecret;
$signature = hash('sha256', $integrityString);
```

### Webhook

El webhook recibe eventos de tipo `transaction.updated`:

- **APPROVED:** Pago exitoso, guarda card_token para pagos recurrentes
- **DECLINED/ERROR:** Pago rechazado
- **PENDING:** Pago en proceso

---

## Base de Datos

### Tabla: enrollments

```sql
id
student_id          -- FK: users.id
program_id          -- FK: academic_programs.id
enrollment_date
status              -- active, waiting, withdrawn, suspended, completed
enrolled_level
payment_commitment_signed
payment_commitment_date
parental_authorization_signed
parental_authorization_date
parent_guardian_name
timestamps
```

### Tabla: payments

```sql
id
student_id          -- FK: users.id
program_id          -- FK: academic_programs.id
enrollment_id       -- FK: enrollments.id
concept
amount, original_amount, paid_amount, remaining_amount
due_date, payment_date
status              -- pending, completed, cancelled, overdue
payment_method
reference_number
recorded_by         -- FK: users.id
notes

-- Campos Wompi
wompi_reference
wompi_transaction_id
metadata            -- JSON

-- Campos pagos recurrentes
card_token
payment_source_id
is_recurring
last_4_digits
card_brand
next_charge_date
failed_attempts

-- Campos cuotas
parent_payment_id   -- FK: payments.id
installment_number
total_installments
payment_type        -- single, installment

timestamps
```

### Tabla: demo_requests

```sql
id
responsible_name, responsible_last_name
responsible_email, responsible_phone, responsible_mobile
responsible_document_type, responsible_document_number
responsible_birth_date, responsible_gender
responsible_address, responsible_city, responsible_department
is_minor
program_id          -- FK: academic_programs.id
schedule_id         -- FK: schedules.id (nullable)
students_data       -- JSON array
status              -- pending, contacted, completed
notes
timestamps
```

---

## Validaciones

### EnrollmentRequest

Ubicación: `app/Http/Requests/EnrollmentRequest.php`

#### Datos del Responsable (siempre requeridos)

| Campo | Validación |
|-------|------------|
| `responsable.name` | required, string, max:255 |
| `responsable.last_name` | required, string, max:255 |
| `responsable.email` | required, email, unique:users |
| `responsable.password` | required, min:8, confirmed |
| `responsable.document_type` | required, in:TI,CC,CE,Pasaporte |
| `responsable.document_number` | required, unique:users |
| `responsable.birth_date` | required, date, before:today |
| `responsable.gender` | required, in:M,F |
| `responsable.address` | required, string |
| `responsable.mobile` | required, string, max:20 |
| `responsable.city` | required, string |
| `responsable.department` | required, string |

#### Datos Musicales (si is_minor = false)

| Campo | Validación |
|-------|------------|
| `responsable.plays_instrument` | required_if:is_minor,false |
| `responsable.desired_instrument` | required_if:is_minor,false |
| `responsable.modality` | required_if:is_minor,false, in:Linaje Kids,Linaje Teens,Linaje Big |
| `responsable.current_level` | required_if:is_minor,false, integer, 1-10 |
| `responsable.program_id` | required_if:is_minor,false, exists:academic_programs |

#### Estudiantes (si is_minor = true)

| Campo | Validación |
|-------|------------|
| `estudiantes` | required_if:is_minor,true, array, min:1, max:10 |
| `estudiantes.*.name` | required, string, max:255 |
| `estudiantes.*.document_number` | required, unique:users |
| `estudiantes.*.program_id` | required, exists:academic_programs |

#### Autorizaciones

| Campo | Validación |
|-------|------------|
| `parental_authorization` | required_if:is_minor,true, accepted |
| `payment_commitment` | required, accepted |

---

## Rutas y Endpoints

### Rutas Públicas (sin autenticación)

```php
// Rate limiting: 10 req/min
GET    /matricula                              → create()
POST   /matricula                              → store()
GET    /matricula/demo/confirmacion/{request}  → demoConfirmation()

// Rate limiting: 20 req/min
GET    /matricula/checkout/{payment}           → checkout()
POST   /matricula/checkout/{payment}/create-payment-link → createPaymentLink()
GET    /matricula/checkout-multiple            → checkoutMultiple()
GET    /matricula/confirmacion                 → confirmation()

// Webhook (sin rate limiting)
POST   /webhook/wompi                          → PaymentController@wompiWebhook
```

### Rutas Autenticadas

```php
GET    /matriculas                    → index()
GET    /matriculas/{enrollment}       → show()
POST   /matriculas                    → store()
GET    /matriculas/{enrollment}/edit  → edit()
PUT    /matriculas/{enrollment}       → update()
DELETE /matriculas/{enrollment}       → destroy()
POST   /matriculas/quick-enroll       → quickEnroll()
POST   /matriculas/{enrollment}/change-status → changeStatus()
```

---

## Generación Automática de Pagos Mensuales

Cuando una inscripción cambia a estado `active`, el sistema genera automáticamente el pago mensual:

1. Obtiene `program.monthly_fee`
2. Si fee > 0, calcula `due_date`:
   - Si hoy.día > 5: próximo mes, día 5
   - Si hoy.día <= 5: mes actual, día 5
3. Verifica que no exista pago para ese mes
4. Crea Payment con concepto "Mensualidad {programa} - {mes año}"

---

## Resumen

El módulo de matrículas de KAIROS:

- Permite inscripciones públicas sin autenticación previa
- Soporta matrícula de adultos y menores
- Integra Wompi para procesar pagos (tarjeta y PSE)
- Crea usuarios automáticamente con roles apropiados
- Genera pagos mensuales automáticos al activar inscripciones
- Valida exhaustivamente mediante Form Request
- Usa transacciones DB para garantizar consistencia
- Soporta clases demo sin crear usuarios
- Implementa rate limiting en rutas públicas
