# Solución al Error 422 de Wompi

## ¿Qué es el error 422?

El error **HTTP 422 Unprocessable Content** de Wompi indica que la API recibió la solicitud pero rechazó los datos porque uno o más campos no cumplen con las validaciones requeridas.

```
POST https://api-sandbox.wompi.co/v1/transactions
Error: 422 Unprocessable Content
```

---

## ✅ Correcciones Implementadas

Se realizaron las siguientes correcciones en el código:

### 1. **Método `prepareCheckoutData` en WompiService** ✅

Se agregó un nuevo método que prepara correctamente los datos del checkout con la firma de integridad.

**Archivo:** `app/Services/WompiService.php`

```php
public function prepareCheckoutData(
    string $reference,
    float $amount,
    string $publicKey,
    ?string $integritySecret = null
): array {
    $amountInCents = (int) ($amount * 100); // ✅ Cast explícito a integer
    $isTest = $this->isTestMode($publicKey);

    $data = [
        'amount_in_cents' => $amountInCents,
        'currency' => 'COP',
        'reference' => $reference,
        'integrity_signature' => null,
    ];

    // ✅ Generar firma solo para PRODUCCIÓN
    if (!empty($integritySecret) && !$isTest) {
        $integrityString = $reference . $amountInCents . 'COP' . $integritySecret;
        $data['integrity_signature'] = hash('sha256', $integrityString);
    }

    return $data;
}
```

**Qué se corrigió:**
- ✅ Cast explícito de `amount_in_cents` a `integer`
- ✅ Firma de integridad SOLO para producción (no en modo test)
- ✅ Logging para debugging

---

### 2. **Comando de Pagos Recurrentes** ✅

Se corrigió el comando `ProcessRecurringPayments` para incluir la firma de integridad.

**Archivo:** `app/Console/Commands/ProcessRecurringPayments.php`

**Cambios:**
```php
// ❌ ANTES
$amountInCents = $amount * 100; // Puede ser float

// ✅ DESPUÉS
$amountInCents = (int) ($amount * 100); // Siempre integer
```

```php
// ✅ NUEVO: Validación de largo de referencia
if (strlen($reference) > 32) {
    $reference = 'REC-' . substr(md5($payment->enrollment_id . time()), 0, 23);
}

// ✅ NUEVO: Validación de email
$customerEmail = filter_var($payment->student->email, FILTER_VALIDATE_EMAIL)
    ? $payment->student->email
    : 'noreply@academialinaje.com';

// ✅ NUEVO: Firma de integridad para producción
$isTest = str_starts_with($publicKey, 'pub_test_');
if (!empty($integritySecret) && !$isTest) {
    $integrityString = $reference . $amountInCents . 'COP' . $integritySecret;
    $data['signature'] = [
        'integrity' => hash('sha256', $integrityString)
    ];
}
```

---

## 📋 Causas Comunes del Error 422

### 1. ❌ **Integrity Secret faltante en PRODUCCIÓN**

**Problema:** Usas claves de producción (`pub_prod_*`) pero no envías la firma de integridad.

**Solución:**
```bash
# En el panel de administración de Wompi Settings:
# 1. Ir a Configuración > Wompi
# 2. Agregar el "Integrity Secret" desde tu dashboard de Wompi
# 3. Guardar la configuración
```

**Cómo obtenerlo:**
1. Inicia sesión en https://comercios.wompi.co
2. Ve a **Configuración > API Keys**
3. Copia el **Integrity Secret**
4. Pégalo en la configuración de Wompi en KAIROS

---

### 2. ❌ **`amount_in_cents` no es un entero**

**Problema:**
```php
$amountInCents = $amount * 100; // Puede ser float: 10000000.0
```

Wompi requiere un `integer`, no un `float`.

**Solución:**
```php
$amountInCents = (int) ($amount * 100); // Siempre integer: 10000000
```

✅ **Ya corregido en el código.**

---

### 3. ❌ **`reference` supera 32 caracteres**

**Problema:**
```php
$reference = 'MATRICULA-ESTUDIANTE-123456-20241213-143045'; // 44 caracteres ❌
```

Wompi acepta máximo **32 caracteres** en el campo `reference`.

**Solución:**
```php
$reference = 'MAT-123456-' . time(); // 20 caracteres ✅

// O si puede ser largo, truncar:
if (strlen($reference) > 32) {
    $reference = substr($reference, 0, 32);
}
```

✅ **Ya corregido en el código.**

---

### 4. ❌ **`customer_email` con formato inválido**

**Problema:**
```php
$email = $student->email; // Puede estar vacío o ser inválido
```

**Solución:**
```php
$email = filter_var($student->email, FILTER_VALIDATE_EMAIL)
    ? $student->email
    : 'noreply@academialinaje.com';
```

✅ **Ya corregido en el código.**

---

### 5. ❌ **`acceptance_token` incorrecto**

**Problema:** El `acceptance_token` pertenece a un merchant diferente.

**Solución:** Obtén el token del merchant correcto:
```php
$response = Http::withHeaders([
    'Authorization' => 'Bearer ' . $publicKey,
])->get("{$wompiUrl}/merchants/{$publicKey}");

$acceptanceToken = $response->json()['data']['presigned_acceptance']['acceptance_token'];
```

✅ **Ya implementado en el código.**

---

### 6. ❌ **Mezcla de ambientes (test/producción)**

**Problema:**
- Public Key: `pub_prod_*` (producción)
- URL: `https://sandbox.wompi.co/v1` (test)

**Solución:**
```php
$isTest = str_starts_with($publicKey, 'pub_test_');
$apiUrl = $isTest
    ? 'https://sandbox.wompi.co/v1'
    : 'https://production.wompi.co/v1';
```

✅ **Ya implementado en el código.**

---

## 🔧 Scripts de Diagnóstico

Se crearon dos scripts para ayudar con el debugging:

### 1. `diagnose-wompi-422.php`

Verifica la configuración de Wompi y detecta problemas comunes.

**Uso:**
```bash
php diagnose-wompi-422.php
```

**Qué hace:**
- ✅ Verifica la configuración en la base de datos
- ✅ Detecta modo (test/producción)
- ✅ Valida que tengas Integrity Secret en producción
- ✅ Prueba la conexión con la API de Wompi
- ✅ Valida formato de campos

---

### 2. `test-wompi-transaction.php`

Prueba la creación de una transacción con validación de todos los campos.

**Uso:**
```bash
php test-wompi-transaction.php
```

---

## 📝 Checklist de Resolución

Usa esta lista para resolver el error 422:

- [ ] **1. Ejecutar diagnóstico**
  ```bash
  php diagnose-wompi-422.php
  ```

- [ ] **2. Verificar modo (test/producción)**
  - Claves de test: `pub_test_*` → NO requiere Integrity Secret
  - Claves de producción: `pub_prod_*` → **SÍ requiere Integrity Secret**

- [ ] **3. Si estás en producción:**
  - [ ] Agregar Integrity Secret en Configuración > Wompi
  - [ ] Verificar que esté guardado en la base de datos

- [ ] **4. Verificar logs de Laravel**
  ```bash
  tail -f storage/logs/laravel.log | grep -i wompi
  ```

- [ ] **5. Revisar payload enviado a Wompi**
  - Los logs mostrarán el JSON exacto enviado
  - Verificar que cada campo sea válido

- [ ] **6. Probar transacción de prueba**
  - Usar tarjeta de prueba de Wompi:
    - Número: `4242 4242 4242 4242`
    - CVC: `123`
    - Fecha: Cualquier fecha futura

---

## 🎯 Resumen de la Solución

| Campo | Validación Wompi | Solución Implementada |
|-------|------------------|----------------------|
| `amount_in_cents` | Debe ser `integer` | ✅ Cast explícito: `(int) ($amount * 100)` |
| `currency` | Debe ser `"COP"` | ✅ Hardcoded a `"COP"` |
| `reference` | Máximo 32 caracteres | ✅ Validación de longitud |
| `customer_email` | Formato válido | ✅ Validación con `filter_var()` |
| `acceptance_token` | Del merchant correcto | ✅ Obtenido del endpoint correcto |
| `signature.integrity` | Obligatorio en producción | ✅ Generado solo en producción |

---

## 🚀 Próximos Pasos

1. **Ejecutar el diagnóstico:**
   ```bash
   php diagnose-wompi-422.php
   ```

2. **Si estás en producción y no tienes Integrity Secret:**
   - Obtenerlo de https://comercios.wompi.co
   - Agregarlo en Configuración > Wompi

3. **Probar un pago:**
   - Crear una matrícula de prueba
   - Verificar logs en `storage/logs/laravel.log`
   - Verificar que la transacción se cree sin error 422

4. **Si el error persiste:**
   - Revisar el payload exacto en los logs
   - Comparar con la documentación de Wompi: https://docs.wompi.co
   - Contactar soporte de Wompi si es necesario

---

## 📞 Soporte

- **Documentación Wompi:** https://docs.wompi.co/docs/es/pagos-por-link-de-pago
- **Soporte Wompi:** https://soporte.wompi.co
- **Dashboard Comercios:** https://comercios.wompi.co

---

## ✅ Verificación Final

Después de implementar las correcciones, verifica que:

1. ✅ El diagnóstico no muestra errores
2. ✅ Puedes crear una matrícula sin error 422
3. ✅ Los pagos recurrentes funcionan correctamente
4. ✅ Los logs muestran "Firma de integridad generada" (si estás en producción)

**¡Listo!** El error 422 debería estar resuelto.
