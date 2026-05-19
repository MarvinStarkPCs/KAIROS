# Análisis de SQL Injection — KAIROS

> Fecha: 2026-05-18  
> Alcance: Código fuente del backend (Laravel 12)  
> Método: Revisión estática de código

---

## Resumen

| Nivel | Hallazgos |
|-------|-----------|
| 🔴 CRÍTICO | 1 |
| 🟡 BAJO | 3 |
| 🟢 SEGURO | El resto de queries |

---

## 🔴 CRÍTICO — Inyección de nombre de columna sin validar

**Archivo:** `app/Http/Controllers/Admin/DemoLeadController.php` línea 38-39

```php
$sortField     = $request->get('sort', 'created_at');
$sortDirection = $request->get('direction', 'desc');
$query->orderBy($sortField, $sortDirection);
```

### Por qué es vulnerable

Laravel **no bindea parámetros en nombres de columna**. El método `orderBy()` escapa el
valor del campo con backticks (`` ` ``), pero un atacante puede romper ese escaping con
caracteres como `(` o subconsultas en ciertos drivers.

La dirección (`asc`/`desc`) no tiene validación alguna: un valor arbitrario se inyecta
directamente en el ORDER BY.

### Payload de prueba

Enviar esta URL autenticado como admin:

```
GET /admin/demo-leads?sort=created_at&direction=DESC,(SELECT SLEEP(5))--
```

Si la respuesta tarda ~5 segundos, la inyección es exitosa (blind time-based).

Otro payload para exfiltrar datos vía error (si errores visibles):

```
GET /admin/demo-leads?sort=(SELECT+1+FROM(SELECT+COUNT(*),CONCAT((SELECT+database()),0x3a,FLOOR(RAND(0)*2))x+FROM+information_schema.tables+GROUP+BY+x)a)&direction=asc
```

### Fix

```php
// Whitelist de columnas permitidas
$allowedSorts = ['name', 'email', 'status', 'created_at', 'phone'];
$allowedDirs  = ['asc', 'desc'];

$sortField     = in_array($request->get('sort'), $allowedSorts)
    ? $request->get('sort')
    : 'created_at';

$sortDirection = in_array(strtolower($request->get('direction', 'desc')), $allowedDirs)
    ? $request->get('direction')
    : 'desc';

$query->orderBy($sortField, $sortDirection);
```

---

## 🟡 BAJO — LIKE con input de usuario (riesgo de wildcard DoS, no SQLi)

Estos tres archivos usan la interpolación `"%{$variable}%"` dentro de un `where LIKE`.

| Archivo | Línea | Campo |
|---------|-------|-------|
| `UserController.php` | 29–32 | `name`, `email`, `document_number` |
| `DemoLeadController.php` | 27–32 | `name`, `email`, `phone` |
| `AuditController.php` | 120 | `description` |

### ¿Son SQLi?

**No.** Laravel pasa el valor como parámetro PDO bindeado — el `%` y `_` en el valor
no rompen la query SQL. Pero:

- Un atacante puede enviar `%` o `_` solos y forzar un full-table scan (DoS de base de datos).
- No hay límite mínimo de caracteres en `DemoLeadController` ni `AuditController`.

### Fix recomendado

Añadir longitud mínima antes de ejecutar la búsqueda:

```php
if ($request->filled('search') && strlen($request->search) >= 2) {
    // ... where LIKE
}
```

Y escapar los wildcards si se quiere búsqueda literal:

```php
$search = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $request->search);
```

---

## 🟢 SEGURO — Queries con selectRaw / whereRaw sin input de usuario

Estas llamadas usan cadenas SQL **hardcodeadas**, no datos del request:

| Archivo | Patrón |
|---------|--------|
| `ReportController.php` (líneas 51, 62, 83, 97, 121) | `selectRaw("DATE_FORMAT(...)")` |
| `TeacherController.php` (líneas 415-418) | `selectRaw('COUNT(*) ...')` |

No hay riesgo de inyección porque el usuario no controla ninguna parte de esas cadenas.

---

## 🟢 SEGURO — Filtros por ID/estado con Eloquent

```php
// EnrollmentController, PaymentController, ScheduleController...
$query->where('program_id', $request->program_id);
$query->where('status', $request->status);
```

Eloquent bindea estos valores como parámetros PDO. Son seguros contra SQL injection clásico.
Asegurarse de que los IDs sean validados como enteros en los Form Requests correspondientes
(ya existen `StoreEnrollmentRequest`, `StorePaymentRequest`, etc.).

---

## Payload de prueba rápida (`""=""or""`)

El patrón `"" = "" OR ""` es un bypass de autenticación clásico para formularios de login.
En KAIROS el login usa **Laravel Fortify** con Eloquent, por lo que este payload
**no tiene efecto** en el login — las queries son parametrizadas:

```sql
-- Lo que genera Fortify internamente (seguro):
SELECT * FROM users WHERE email = ? LIMIT 1
-- El valor "=" or "" se pasa como string literal, no como SQL
```

Prueba: ingresar en el login:
- Email: `" OR "1"="1`
- Password: `" OR "1"="1`

**Resultado esperado:** Error de credenciales — sistema no vulnerable en el login.

---

## Resumen de acciones

| Prioridad | Acción | Archivo |
|-----------|--------|---------|
| 🔴 Inmediata | Agregar whitelist a `orderBy` | `DemoLeadController.php:38` |
| 🟡 Esta semana | Agregar longitud mínima a búsquedas LIKE | `UserController`, `DemoLeadController`, `AuditController` |
| 🟢 Opcional | Escapar wildcards en LIKE | Mismos archivos anteriores |
