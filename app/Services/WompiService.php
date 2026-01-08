<?php

namespace App\Services;

use App\Models\WompiSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WompiService
{
    /**
     * Obtener configuración activa de Wompi desde la base de datos
     */
    public function getActiveConfig(): array
    {
        $wompiSetting = WompiSetting::where('is_active', true)->first();

        Log::info('Wompi: Obteniendo configuración activa', [
            'setting_found' => $wompiSetting ? true : false,
        ]);

        if (!$wompiSetting) {
            throw new \Exception('No hay una configuración activa de Wompi. Por favor configure Wompi desde Configuración.');
        }

        if (empty($wompiSetting->public_key)) {
            throw new \Exception('La configuración de Wompi no tiene una llave pública.');
        }

        if (empty($wompiSetting->api_url)) {
            throw new \Exception('La configuración de Wompi no tiene una URL de API configurada.');
        }

        $isTest = $this->isTestMode($wompiSetting->public_key);

        // Validar integrity_secret según el modo
        if (!$isTest && empty($wompiSetting->integrity_secret)) {
            throw new \Exception('La configuración de producción requiere un Integrity Secret. Por favor configúrelo desde el panel de Wompi.');
        }

        if ($isTest && !empty($wompiSetting->integrity_secret)) {
            Log::info('Wompi: Integrity Secret configurado en modo test (necesario para PSE)', [
                'public_key' => substr($wompiSetting->public_key, 0, 15) . '...',
            ]);
        }

        Log::info('Wompi: Configuración activa cargada', [
            'public_key' => substr($wompiSetting->public_key, 0, 15) . '...',
            'api_url' => $wompiSetting->api_url,
            'environment' => $wompiSetting->environment,
            'is_test' => $isTest,
            'has_integrity_secret' => !empty($wompiSetting->integrity_secret),
        ]);

        return [
            'public_key' => $wompiSetting->public_key,
            'private_key' => $wompiSetting->private_key,
            'integrity_secret' => $wompiSetting->integrity_secret,
            'events_secret' => $wompiSetting->events_secret,
            'api_url' => $wompiSetting->api_url,
            'environment' => $wompiSetting->environment,
            'is_test' => $isTest,
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
     * Verificar si los pagos están activos
     */
    public function isPaymentActive(): bool
    {
        $wompiSetting = WompiSetting::where('is_active', true)->first();
        return $wompiSetting && $wompiSetting->is_active;
    }

    /**
     * Crear un link de pago en Wompi
     *
     * @param string $reference Referencia única del pago
     * @param float $amount Monto en pesos colombianos
     * @param string $customerEmail Email del cliente
     * @param string $customerName Nombre del cliente
     * @param string|null $description Descripción del pago
     * @return array ['url' => string, 'id' => string, 'reference' => string]
     */
    public function createPaymentLink(
        string $reference,
        float $amount,
        string $customerEmail,
        string $customerName,
        ?string $description = null
    ): array {
        $config = $this->getActiveConfig();
        $amountInCents = (int) ($amount * 100);

        Log::info('Wompi: Creando payment link', [
            'reference' => $reference,
            'amount' => $amount,
            'amount_in_cents' => $amountInCents,
            'customer' => $customerEmail,
            'environment' => $config['environment']
        ]);

        $apiUrl = $config['api_url'];

        // Datos para crear el payment link
        $payload = [
            'name' => $description ?? 'Pago - Academia Linaje',
            'description' => $description ?? 'Pago de matrícula',
            'single_use' => true, // El link solo se puede usar una vez
            'collect_shipping' => false, // No recolectar dirección de envío
            'currency' => 'COP',
            'amount_in_cents' => $amountInCents,
            'redirect_url' => config('wompi.redirect_url'),
        ];

        // Si tenemos integrity secret, generar firma
        if (!empty($config['integrity_secret'])) {
            $integrityString = $reference . $amountInCents . 'COP' . $config['integrity_secret'];
            $payload['integrity'] = hash('sha256', $integrityString);

            Log::info('Wompi: Firma de integridad generada', [
                'reference' => $reference,
                'signature' => $payload['integrity']
            ]);
        }

        try {
            // Llamar a la API de Wompi para crear el payment link
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $config['private_key'],
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post($apiUrl . '/payment_links', $payload);

            if (!$response->successful()) {
                Log::error('Wompi: Error al crear payment link', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'payload' => $payload
                ]);

                throw new \Exception('Error al crear el link de pago: ' . $response->body());
            }

            $data = $response->json();

            // Log de la respuesta completa para debugging
            Log::info('Wompi: Respuesta completa de la API', [
                'full_response' => $data
            ]);

            $paymentLinkId = $data['data']['id'] ?? null;

            if (!$paymentLinkId) {
                Log::error('Wompi: No se encontró el ID en la respuesta', [
                    'response_structure' => array_keys($data ?? []),
                    'data_structure' => isset($data['data']) ? array_keys($data['data']) : 'data key not found'
                ]);
                throw new \Exception('Wompi no devolvió un ID de payment link');
            }

            // Wompi NO devuelve el URL directamente, hay que construirlo manualmente
            // El formato es: https://checkout.wompi.co/l/{id}
            $paymentUrl = "https://checkout.wompi.co/l/{$paymentLinkId}";

            Log::info('Wompi: Payment link creado exitosamente', [
                'id' => $paymentLinkId,
                'url' => $paymentUrl,
            ]);

            return [
                'url' => $paymentUrl,
                'id' => $paymentLinkId,
                'reference' => $reference,
            ];

        } catch (\Exception $e) {
            Log::error('Wompi: Excepción al crear payment link', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }

    /**
     * Generar firma de integridad para validar webhooks
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
     * Verificar firma de integridad de un webhook
     */
    public function verifyWebhookSignature(array $event, string $signature): bool
    {
        $config = $this->getActiveConfig();

        if (empty($config['integrity_secret'])) {
            Log::warning('Wompi: No se puede verificar firma - no hay integrity_secret configurado');
            return false;
        }

        // Generar la firma esperada
        $expectedSignature = hash('sha256', json_encode($event) . $config['integrity_secret']);

        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Preparar datos para checkout con firma de integridad
     *
     * @param string $reference Referencia única del pago
     * @param float $amount Monto en pesos colombianos
     * @param string $publicKey Llave pública de Wompi
     * @param string|null $integritySecret Secret para firma de integridad
     * @return array Datos preparados para el checkout
     */
    public function prepareCheckoutData(
        string $reference,
        float $amount,
        string $publicKey,
        ?string $integritySecret = null
    ): array {
        $amountInCents = (int) ($amount * 100);
        $isTest = $this->isTestMode($publicKey);

        $data = [
            'amount_in_cents' => $amountInCents,
            'currency' => 'COP',
            'reference' => $reference,
            'integrity_signature' => null,
        ];

        // Generar firma de integridad si hay integrity_secret configurado
        // Según la documentación de Wompi:
        // - En modo test (pub_test_*): La firma es OPCIONAL, pero algunos métodos como PSE la requieren
        // - En modo producción (pub_prod_*): La firma es OBLIGATORIA
        if (!empty($integritySecret)) {
            $integrityString = $reference . $amountInCents . 'COP' . $integritySecret;
            $data['integrity_signature'] = hash('sha256', $integrityString);

            Log::info('Wompi: Firma de integridad generada para checkout', [
                'reference' => $reference,
                'amount_in_cents' => $amountInCents,
                'is_test' => $isTest,
                'mode' => $isTest ? 'TEST (para PSE)' : 'PRODUCCIÓN',
                'signature' => substr($data['integrity_signature'], 0, 10) . '...'
            ]);
        } else {
            Log::warning('Wompi: No se generó firma de integridad (integrity_secret no configurado)', [
                'reference' => $reference,
                'is_test' => $isTest
            ]);
        }


        return $data;
    }
}
