# Configuración SMTP - KAIROS

## Resumen de la Implementación

Se ha configurado completamente el sistema SMTP para enviar correos electrónicos desde la aplicación KAIROS. El sistema incluye:

### 1. Características Implementadas

- **Configuración SMTP dinámica**: Los ajustes se guardan en la base de datos y se cargan automáticamente
- **Encriptación de contraseñas**: Las contraseñas SMTP se encriptan usando Laravel Crypt
- **Interfaz de usuario completa**: Panel de configuración en Settings con todas las opciones
- **Prueba de correos**: Función para enviar correos de prueba y verificar la configuración
- **Notificaciones listas**: Sistema de notificaciones preparado para diferentes eventos
- **Alertas flash**: Feedback visual para todas las operaciones (éxito, error, advertencia)

### 2. Acceso a la Configuración

La configuración SMTP está disponible en:
- **URL**: `/settings/smtp`
- **Menú**: Settings > Servidor SMTP

### 3. Notificaciones Disponibles

#### TestEmailNotification
Notificación de prueba para verificar la configuración SMTP.

**Uso:**
```php
use App\Models\User;
use App\Notifications\TestEmailNotification;
use Illuminate\Support\Facades\Notification;

$user = User::find(1);
$user->notify(new TestEmailNotification());
```

#### WelcomeNotification
Notificación de bienvenida para nuevos usuarios.

**Uso:**
```php
use App\Notifications\WelcomeNotification;

$newUser->notify(new WelcomeNotification());
```

#### EnrollmentStatusNotification
Notificación de cambio de estado de inscripción.

**Uso:**
```php
use App\Notifications\EnrollmentStatusNotification;

$student = $enrollment->student;
$student->notify(new EnrollmentStatusNotification($enrollment, 'active'));
// Estados: 'active', 'rejected', 'cancelled'
```

#### PaymentReceivedNotification
Notificación de confirmación de pago recibido.

**Uso:**
```php
use App\Notifications\PaymentReceivedNotification;

$student = $payment->student;
$student->notify(new PaymentReceivedNotification($payment));
```

### 4. Ejemplos de Integración

#### Enviar bienvenida al crear usuario
```php
// En UserController@store o en el evento de registro
$user = User::create($validated);
$user->notify(new WelcomeNotification());
```

#### Notificar cambio de estado de inscripción
```php
// En EnrollmentController@update
$enrollment->update(['status' => 'active']);
$enrollment->student->notify(
    new EnrollmentStatusNotification($enrollment, 'active')
);
flash_success('Inscripción aprobada y notificación enviada al estudiante');
```

#### Confirmar pago recibido
```php
// En PaymentController@store
$payment = Payment::create($validated);
$payment->student->notify(new PaymentReceivedNotification($payment));
flash_success('Pago registrado y confirmación enviada al estudiante');
```

### 5. Alertas Flash

El sistema utiliza las siguientes funciones para mostrar alertas:

```php
// Éxito (verde)
flash_success('Operación completada correctamente');

// Error (rojo)
flash_error('Ocurrió un error al procesar la solicitud');

// Advertencia (amarillo)
flash_warning('Ten cuidado con esta acción');

// Información (azul)
flash_info('Aquí hay información importante');
```

### 6. Configuración del Proveedor

El `DynamicMailConfigServiceProvider` carga automáticamente la configuración SMTP activa al iniciar la aplicación.

- Está registrado en `bootstrap/providers.php`
- Carga la configuración de la base de datos
- Si falla (ej: durante migraciones), usa la configuración del `.env`

### 7. Seguridad

- Las contraseñas SMTP se encriptan usando `Crypt::encryptString()`
- Las contraseñas nunca se exponen en las respuestas de la API
- El campo `password` está en el array `$hidden` del modelo

### 8. Estructura de Base de Datos

Tabla `smtp_settings`:
- `id`: ID único
- `host`: Servidor SMTP (ej: smtp.gmail.com)
- `port`: Puerto (ej: 587)
- `username`: Usuario/correo para autenticación
- `password`: Contraseña encriptada
- `encryption`: Tipo de encriptación (tls, ssl, null)
- `from_address`: Correo del remitente
- `from_name`: Nombre del remitente
- `is_active`: Si esta configuración está activa
- `timestamps`: created_at, updated_at

### 9. Prueba del Sistema

1. Accede a `/settings/smtp`
2. Configura los datos de tu servidor SMTP
3. Guarda la configuración (verás una alerta de éxito)
4. Ingresa un correo de prueba en la sección inferior
5. Haz clic en "Enviar Prueba"
6. Verifica el correo en la bandeja de entrada

### 10. Proveedores SMTP Comunes

#### Gmail
- Host: `smtp.gmail.com`
- Port: `587`
- Encryption: `TLS`
- Nota: Requiere "App Password" si tienes 2FA habilitado

#### Office 365 / Outlook
- Host: `smtp.office365.com`
- Port: `587`
- Encryption: `TLS`

#### SendGrid
- Host: `smtp.sendgrid.net`
- Port: `587`
- Encryption: `TLS`
- Username: `apikey`
- Password: Tu API Key

#### Mailgun
- Host: `smtp.mailgun.org`
- Port: `587`
- Encryption: `TLS`

### 11. Logs de Actividad

Todos los cambios en la configuración SMTP se registran automáticamente usando Spatie Activity Log.

Ver logs:
```php
use Spatie\Activitylog\Models\Activity;

$activities = Activity::where('log_name', 'smtp_settings')
    ->orderBy('created_at', 'desc')
    ->get();
```

### 12. Troubleshooting

Si los correos no se envían:

1. Verifica que la configuración SMTP esté marcada como activa
2. Revisa los logs de Laravel: `storage/logs/laravel.log`
3. Verifica que el puerto no esté bloqueado por firewall
4. Para Gmail, asegúrate de usar App Password, no tu contraseña normal
5. Verifica que las credenciales sean correctas

### 13. Personalización de Templates

Los correos usan las plantillas de Laravel Mail. Para personalizar:

```bash
php artisan vendor:publish --tag=laravel-mail
```

Esto copiará las plantillas a `resources/views/vendor/mail/`.

---

## Próximos Pasos Recomendados

1. **Colas (Queues)**: Configurar queues para enviar correos en segundo plano
2. **Rate Limiting**: Implementar límites de envío para evitar spam
3. **Templates personalizados**: Diseñar templates HTML personalizados
4. **Múltiples configuraciones**: Soportar múltiples servidores SMTP
5. **Logs de correos enviados**: Tabla para registrar todos los correos enviados
