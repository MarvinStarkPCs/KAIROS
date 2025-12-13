<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\WompiSetting;
use Illuminate\Support\Facades\Http;

echo "\n";
echo "╔══════════════════════════════════════════════════════╗\n";
echo "║  DIAGNÓSTICO WOMPI - ERROR 422                       ║\n";
echo "╚══════════════════════════════════════════════════════╝\n\n";

// 1. Verificar configuración en base de datos
echo "📋 PASO 1: Verificar configuración en base de datos\n";
echo str_repeat("─", 54) . "\n";

$wompiSetting = WompiSetting::where('is_active', true)->first();

if (!$wompiSetting) {
    echo "❌ ERROR: No hay configuración activa de Wompi\n";
    echo "   👉 Acción: Configura Wompi desde el panel de administración\n\n";
    exit(1);
}

$publicKey = $wompiSetting->public_key;
$privateKey = $wompiSetting->private_key;
$integritySecret = $wompiSetting->integrity_secret;

// Detectar modo (test/producción)
$isTest = str_starts_with($publicKey, 'pub_test_');
$mode = $isTest ? '🧪 TEST (Sandbox)' : '🚀 PRODUCCIÓN';

echo "✅ Configuración encontrada:\n";
echo "   ID: {$wompiSetting->id}\n";
echo "   Nombre: {$wompiSetting->name}\n";
echo "   Modo: $mode\n";
echo "   Public Key: " . substr($publicKey, 0, 15) . "..." . substr($publicKey, -5) . "\n";
echo "   Private Key: " . (empty($privateKey) ? '❌ NO CONFIGURADO' : '✅ Configurado') . "\n";
echo "   Integrity Secret: " . (empty($integritySecret) ? '❌ NO CONFIGURADO' : '✅ Configurado') . "\n\n";

// 2. Verificar requisitos según modo
echo "🔍 PASO 2: Validar requisitos según modo\n";
echo str_repeat("─", 54) . "\n";

$errors = [];
$warnings = [];

if (empty($publicKey)) {
    $errors[] = "Public Key está vacío";
}

if (empty($privateKey)) {
    $errors[] = "Private Key está vacío";
}

// La firma de integridad es OBLIGATORIA en producción
if (!$isTest && empty($integritySecret)) {
    $errors[] = "Integrity Secret es OBLIGATORIO en modo PRODUCCIÓN";
    echo "❌ CRÍTICO: Estás usando claves de PRODUCCIÓN sin Integrity Secret\n";
    echo "   Wompi SIEMPRE rechazará las transacciones con error 422\n";
    echo "   👉 Solución: Agrega el WOMPI_INTEGRITY_SECRET desde tu dashboard de Wompi\n\n";
}

if ($isTest && empty($integritySecret)) {
    $warnings[] = "Integrity Secret no configurado (opcional en TEST)";
    echo "⚠️  Integrity Secret no configurado (OK para modo TEST)\n\n";
}

// 3. Probar autenticación con Wompi
$apiUrl = $isTest ? 'https://sandbox.wompi.co/v1' : 'https://production.wompi.co/v1';

echo "🔍 PASO 3: Probar conexión con Wompi API\n";
echo str_repeat("─", 54) . "\n";
echo "   URL: $apiUrl\n";

try {
    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $publicKey,
    ])->get("{$apiUrl}/merchants/{$publicKey}");

    if ($response->successful()) {
        $merchantData = $response->json();
        $acceptanceToken = $merchantData['data']['presigned_acceptance']['acceptance_token'] ?? null;

        echo "✅ Conexión exitosa con Wompi\n";
        echo "   Merchant ID: " . ($merchantData['data']['id'] ?? 'N/A') . "\n";
        echo "   Nombre comercial: " . ($merchantData['data']['legal_name'] ?? 'N/A') . "\n";
        echo "   Acceptance Token: " . ($acceptanceToken ? '✅ Obtenido' : '❌ No disponible') . "\n\n";
    } else {
        echo "❌ Error al conectar con Wompi\n";
        echo "   Status: " . $response->status() . "\n";
        echo "   Respuesta: " . $response->body() . "\n\n";
        $errors[] = "No se pudo autenticar con Wompi";
    }
} catch (Exception $e) {
    echo "❌ EXCEPCIÓN: " . $e->getMessage() . "\n\n";
    $errors[] = "Error de conexión con Wompi: " . $e->getMessage();
}

// 4. Validar formato de campos típicos de transacción
echo "🔍 PASO 4: Validar formato de campos\n";
echo str_repeat("─", 54) . "\n";

// Simular datos de transacción
$testReference = 'MAT-12345-' . time();
$testAmount = 100000;
$testAmountInCents = (int) ($testAmount * 100);
$testEmail = 'estudiante@academialinaje.com';

echo "   Reference: $testReference\n";
echo "     - Longitud: " . strlen($testReference) . " caracteres " . (strlen($testReference) <= 32 ? '✅' : '❌ >32 caracteres') . "\n";
echo "     - Formato: " . (preg_match('/^[a-zA-Z0-9_-]+$/', $testReference) ? '✅ Válido' : '❌ Caracteres inválidos') . "\n\n";

echo "   Amount: \$" . number_format($testAmount, 0, ',', '.') . " COP\n";
echo "     - Amount in cents: $testAmountInCents\n";
echo "     - Tipo: " . gettype($testAmountInCents) . " " . (is_int($testAmountInCents) ? '✅' : '❌ Debe ser integer') . "\n";
echo "     - Mínimo: " . ($testAmountInCents >= 100 ? '✅ ≥ $1 COP' : '❌ < $1 COP') . "\n\n";

echo "   Currency: COP ✅\n\n";

echo "   Customer Email: $testEmail\n";
echo "     - Formato: " . (filter_var($testEmail, FILTER_VALIDATE_EMAIL) ? '✅ Válido' : '❌ Inválido') . "\n\n";

if (!$isTest && !empty($integritySecret)) {
    $integrityString = $testReference . $testAmountInCents . 'COP' . $integritySecret;
    $signature = hash('sha256', $integrityString);

    echo "   Firma de Integridad: ✅\n";
    echo "     - Cadena: {$testReference}{$testAmountInCents}COP[SECRET_OCULTO]\n";
    echo "     - SHA256: " . substr($signature, 0, 20) . "...\n\n";
}

// 5. Resumen y recomendaciones
echo "╔══════════════════════════════════════════════════════╗\n";
echo "║  RESUMEN                                             ║\n";
echo "╚══════════════════════════════════════════════════════╝\n\n";

if (!empty($errors)) {
    echo "❌ ERRORES CRÍTICOS (" . count($errors) . "):\n";
    foreach ($errors as $i => $error) {
        echo "   " . ($i + 1) . ". $error\n";
    }
    echo "\n";
}

if (!empty($warnings)) {
    echo "⚠️  ADVERTENCIAS (" . count($warnings) . "):\n";
    foreach ($warnings as $i => $warning) {
        echo "   " . ($i + 1) . ". $warning\n";
    }
    echo "\n";
}

if (empty($errors) && empty($warnings)) {
    echo "✅ ¡TODO CORRECTO!\n";
    echo "   La configuración parece válida.\n\n";
} elseif (empty($errors)) {
    echo "✅ Configuración funcional con advertencias menores.\n\n";
}

echo "📚 CAUSAS COMUNES DEL ERROR 422:\n";
echo str_repeat("─", 54) . "\n";
echo "1. ❌ Integrity Secret faltante en modo PRODUCCIÓN\n";
echo "2. ❌ amount_in_cents no es un entero (es float/string)\n";
echo "3. ❌ reference supera 32 caracteres\n";
echo "4. ❌ customer_email con formato inválido\n";
echo "5. ❌ acceptance_token de un merchant diferente\n";
echo "6. ❌ Mezcla de claves test con producción\n\n";

echo "🔧 PRÓXIMOS PASOS:\n";
echo str_repeat("─", 54) . "\n";

if (!empty($errors)) {
    echo "1. Corregir los errores listados arriba\n";
    echo "2. Volver a ejecutar este diagnóstico\n";
    echo "3. Intentar una transacción de prueba\n\n";
} else {
    echo "1. Revisar logs de Laravel: storage/logs/laravel.log\n";
    echo "2. Verificar el payload exacto enviado a Wompi\n";
    echo "3. Si el error persiste, contactar soporte de Wompi\n\n";
}

echo "💡 TIP: Para ver el payload exacto enviado a Wompi,\n";
echo "   revisa los logs en storage/logs/laravel.log\n\n";

// Código de salida
exit(empty($errors) ? 0 : 1);
