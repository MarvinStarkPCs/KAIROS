# Flujo de Pagos - KAIROS

## Resumen de Implementación

Este documento describe cómo funciona el sistema de pagos con dos flujos diferentes: pagos por pasarela (Wompi) y pagos manuales.

---

## 1. Pagos por Pasarela (Wompi)

### Flujo:
1. **Usuario se inscribe** mediante el formulario público de matrícula
2. **Se crea el pago** con `wompi_reference` y estado `pending`
3. **Usuario paga** a través de la pasarela de Wompi
4. **Wompi notifica** el pago a través del webhook
5. **Sistema procesa el pago:**
   - Marca el pago como `completed`
   - Calcula la fecha de inicio: **5 días hábiles desde la fecha del pago**
   - **Envía correo electrónico** al estudiante/responsable con:
     - Confirmación del pago
     - Fecha exacta de inicio de clases
     - Detalles del programa

### Archivo Principal:
- **Controlador:** `app/Http/Controllers/PaymentController.php` (método `wompiWebhook`)
- **Mailable:** `app/Mail/PaymentConfirmed.php`
- **Vista Email:** `resources/views/emails/payment-confirmed.blade.php`

### Cálculo de Días Hábiles:
La clase `PaymentConfirmed` incluye una función que calcula 5 días hábiles (lunes a viernes), excluyendo sábados y domingos.

**Ejemplo:**
- Pago realizado: Lunes 20 de noviembre
- Fecha de inicio: Lunes 27 de noviembre (5 días hábiles después)

---

## 2. Pagos Manuales (Dentro de la Plataforma)

### Flujo:
1. **Administrador crea inscripción manual** dentro de la plataforma
2. **Se genera el pago** con fecha de vencimiento entre el **1 y 5 del mes**
3. **Sistema automático verifica** el día 6 de cada mes:
   - Si el pago está `pending` (no confirmado)
   - Cambia el estado del pago a `overdue` (vencido)
   - Cambia el estado de la inscripción a `suspended` (suspendida)

### Archivos Principales:
- **Comando:** `app/Console/Commands/CheckPendingManualPayments.php`
- **Tarea Programada:** Configurada en `bootstrap/app.php`
  - Se ejecuta el día 6 de cada mes a las 7:00 AM

### Ejecución Manual:
Si deseas probar el comando manualmente:
```bash
php artisan payments:check-pending-manual
```

---

## 3. Estados de Pago

| Estado | Descripción |
|--------|-------------|
| `pending` | Pago creado, esperando confirmación |
| `completed` | Pago confirmado y procesado |
| `overdue` | Pago vencido (manual después del día 5) |
| `cancelled` | Pago rechazado o cancelado |

---

## 4. Estados de Inscripción (Enrollment)

| Estado | Descripción |
|--------|-------------|
| `active` | Inscripción activa |
| `waiting` | En lista de espera |
| `withdrawn` | Retirado |
| `suspended` | **NUEVO** - Suspendido por falta de pago |

---

## 5. Tareas Programadas (Cron Jobs)

En producción, asegúrate de configurar el cron de Laravel:

```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

Las tareas configuradas son:
- **Día 25 del mes a las 2:00 AM:** Generar mensualidades (`payments:generate-monthly`)
- **Diariamente a las 6:00 AM:** Marcar pagos vencidos (`payments:mark-overdue`)
- **Día 6 del mes a las 7:00 AM:** Verificar pagos manuales pendientes (`payments:check-pending-manual`)

---

## 6. Configuración de Email

Asegúrate de tener configurado el servicio de correo en tu archivo `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@kairos.com
MAIL_FROM_NAME="KAIROS"
```

O utiliza la configuración dinámica desde la base de datos (tabla `smtp_settings`).

---

## 7. Testing

### Probar Email de Confirmación:
Puedes probar el envío de emails usando Tinker:

```bash
php artisan tinker
```

```php
$payment = \App\Models\Payment::find(1); // Usa un ID real
\Mail::to('test@example.com')->send(new \App\Mail\PaymentConfirmed($payment));
```

### Probar Comando de Verificación:
```bash
php artisan payments:check-pending-manual
```

---

## 8. Logs

El sistema registra logs importantes en:
- `storage/logs/laravel.log`

Para webhooks de Wompi, busca entradas con:
- `Wompi Webhook recibido`
- `Pago aprobado`
- `Email enviado al estudiante`
- `Email enviado al padre/guardian`

---

## Notas Importantes

- Los emails se envían tanto al estudiante (si tiene email) como al padre/guardian
- Los días hábiles excluyen sábados y domingos
- El comando de verificación solo se ejecuta después del día 5 del mes
- Los pagos por pasarela (Wompi) no tienen fecha límite estricta
- Los pagos manuales deben confirmarse antes del día 5 del mes
