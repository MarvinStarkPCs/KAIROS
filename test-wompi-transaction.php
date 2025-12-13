<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

echo "=========================================\n";
echo "  TEST DE TRANSACCIÓN WOMPI (422 DEBUG)\n";
echo "=========================================\n\n";

// Obtener configuración de Wompi
$publicKey = config('wompi.public_key');
$privateKey = config('wompi.private_key');
$integritySecret = config('wompi.integrity_secret');
$wompiUrl = config('wompi.url');

echo "📋 CONFIGURACIÓN:\n";
echo "   Public Key: " . substr($publicKey, 0, 20) . "...\n";
echo "   Private Key: " . (empty($privateKey) ? '❌ NO CONFIGURADO' : '✅ Configurado') . "\n";
echo "   Integrity Secret: " . (empty($integritySecret) ? '❌ NO CONFIGURADO' : '✅ Configurado') . "\n";
echo "   Wompi URL: $wompiUrl\n";
echo "   Modo: " . (str_starts_with($publicKey, 'pub_test_') ? '🧪 TEST' : '🚀 PRODUCCIÓN') . "\n\n";

// Validar configuración
if (empty($publicKey) || empty($privateKey)) {
    echo "❌ ERROR: Faltan llaves de Wompi en .env\n";
    exit(1);
}

$isTest = str_starts_with($publicKey, 'pub_test_');

if (!$isTest && empty($integritySecret)) {
    echo "⚠️  ADVERTENCIA: Estás en modo PRODUCCIÓN pero no hay WOMPI_INTEGRITY_SECRET configurado.\n";
    echo "   Wompi rechazará la transacción con error 422.\n\n";
}

// 1. Obtener acceptance_token
echo "🔍 PASO 1: Obteniendo acceptance_token...\n";

try {
    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $publicKey,
    ])->get("{$wompiUrl}/merchants/{$publicKey}");

    if (!$response->successful()) {
        echo "❌ ERROR al obtener acceptance_token:\n";
        echo "   Status: " . $response->status() . "\n";
        echo "   Body: " . $response->body() . "\n\n";
        exit(1);
    }

    $merchantData = $response->json();
    $acceptanceToken = $merchantData['data']['presigned_acceptance']['acceptance_token'] ?? null;

    if (empty($acceptanceToken)) {
        echo "❌ ERROR: No se pudo obtener acceptance_token\n";
        exit(1);
    }

    echo "✅ Acceptance Token obtenido: " . substr($acceptanceToken, 0, 30) . "...\n\n";

} catch (Exception $e) {
    echo "❌ EXCEPCIÓN: " . $e->getMessage() . "\n";
    exit(1);
}

// 2. Preparar datos de transacción
echo "🔍 PASO 2: Preparando datos de transacción...\n";

$reference = 'TEST-' . time();
$amount = 50000; // $50,000 COP
$amountInCents = (int) ($amount * 100); // IMPORTANTE: Cast a int
$customerEmail = 'test@academialinaje.com';

echo "   Reference: $reference (largo: " . strlen($reference) . " caracteres)\n";
echo "   Amount: $" . number_format($amount, 0, ',', '.') . " COP\n";
echo "   Amount in cents: $amountInCents (" . gettype($amountInCents) . ")\n";
echo "   Currency: COP\n";
echo "   Customer Email: $customerEmail\n";

// Validar campos
$errors = [];

if (strlen($reference) > 32) {
    $errors[] = "❌ Reference supera 32 caracteres (" . strlen($reference) . ")";
}

if (!is_int($amountInCents)) {
    $errors[] = "❌ amount_in_cents NO es un entero: " . gettype($amountInCents);
}

if ($amountInCents < 100) {
    $errors[] = "❌ amount_in_cents es menor a 100 (mínimo $1 COP)";
}

if (!filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "❌ Email inválido: $customerEmail";
}

if (empty($acceptanceToken)) {
    $errors[] = "❌ acceptance_token vacío";
}

if (!empty($errors)) {
    echo "\n⚠️  ERRORES DE VALIDACIÓN DETECTADOS:\n";
    foreach ($errors as $error) {
        echo "   $error\n";
    }
    echo "\n";
}

// 3. Construir payload
echo "\n🔍 PASO 3: Construyendo payload...\n";

$payload = [
    'acceptance_token' => $acceptanceToken,
    'amount_in_cents' => $amountInCents,
    'currency' => 'COP',
    'customer_email' => $customerEmail,
    'reference' => $reference,
];

// Agregar firma de integridad solo para producción
if (!$isTest && !empty($integritySecret)) {
    $integrityString = $reference . $amountInCents . 'COP' . $integritySecret;
    $payload['signature'] = [
        'integrity' => hash('sha256', $integrityString)
    ];
    echo "✅ Firma de integridad añadida (PRODUCCIÓN)\n";
    echo "   Cadena: {$reference}{$amountInCents}COP[SECRET]\n";
    echo "   Hash: " . $payload['signature']['integrity'] . "\n";
} else {
    echo "ℹ️  Sin firma de integridad (modo TEST)\n";
}

echo "\n📤 PAYLOAD COMPLETO:\n";
echo json_encode($payload, JSON_PRETTY_PRINT) . "\n\n";

// 4. Intentar crear transacción (comentado para evitar cargos reales)
echo "🔍 PASO 4: Creando transacción...\n";
echo "⚠️  NOTA: Este test NO crea una transacción real con tarjeta.\n";
echo "   Para probar con tarjeta, usa la tarjeta de prueba de Wompi:\n";
echo "   - Número: 4242 4242 4242 4242\n";
echo "   - CVC: 123\n";
echo "   - Fecha: Cualquier fecha futura\n\n";

// Descomentar para hacer petición real:
/*
$response = Http::withHeaders([
    'Authorization' => 'Bearer ' . $privateKey,
    'Content-Type' => 'application/json',
])->post("{$wompiUrl}/transactions", $payload);

if ($response->successful()) {
    echo "✅ TRANSACCIÓN CREADA EXITOSAMENTE\n";
    $transaction = $response->json();
    echo json_encode($transaction, JSON_PRETTY_PRINT) . "\n";
} else {
    echo "❌ ERROR EN TRANSACCIÓN:\n";
    echo "   Status: " . $response->status() . "\n";
    echo "   Body: " . $response->body() . "\n";
}
*/

echo "\n=========================================\n";
echo "  RESUMEN DE VALIDACIÓN\n";
echo "=========================================\n\n";

if (empty($errors)) {
    echo "✅ Todos los campos parecen válidos.\n\n";
    echo "Si sigues recibiendo error 422:\n";
    echo "1. Verifica que el acceptance_token sea del mismo merchant\n";
    echo "2. En PRODUCCIÓN, asegúrate de tener WOMPI_INTEGRITY_SECRET en .env\n";
    echo "3. Verifica que no estés mezclando claves de test con producción\n";
    echo "4. Revisa los logs de Laravel en storage/logs/laravel.log\n";
} else {
    echo "⚠️  Se detectaron " . count($errors) . " errores. Corrígelos antes de continuar.\n";
}

echo "\n";
