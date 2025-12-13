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

        if (!$wompiSetting) {
            throw new \Exception('No hay una configuración activa de Wompi. Por favor configure Wompi desde Configuración.');
        }

        if (empty($wompiSetting->public_key)) {
            throw new \Exception('La configuración de Wompi no tiene una llave pública.');
        }

        return [
            'public_key' => $wompiSetting->public_key,
            'private_key' => $wompiSetting->private_key,
            'integrity_secret' => $wompiSetting->integrity_secret,
            'is_test' => $this->isTestMode($wompiSetting->public_key),
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
     * Obtener URL base de la API según el modo (test/producción)
     */
    private function getApiUrl(bool $isTest): string
    {
        return $isTest
            ? 'https://sandbox.wompi.co/v1'
            : 'https://production.wompi.co/v1';
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
            'is_test' => $config['is_test']
        ]);

        $apiUrl = $this->getApiUrl($config['is_test']);

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
}
