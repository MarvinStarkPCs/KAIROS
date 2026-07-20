<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Services\WompiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class NequiController extends Controller
{
    public function __construct(private WompiService $wompiService) {}

    /**
     * Vincular Nequi creando un payment source para débito automático.
     * El usuario recibe UNA sola notificación para autorizar; los cobros futuros
     * son automáticos sin necesidad de aprobar cada mes.
     */
    public function link(Request $request)
    {
        $request->validate([
            'phone' => ['required', 'string', 'regex:/^3[0-9]{9}$/'],
        ], [
            'phone.required' => 'El número de celular es obligatorio.',
            'phone.regex' => 'El número debe ser un celular colombiano (10 dígitos, empezando por 3).',
        ]);

        $user = Auth::user();

        try {
            $sourceId = $this->wompiService->createNequiPaymentSource(
                phone: $request->phone,
                customerEmail: $user->email,
                merchantCustomerId: 'KAIROS-U' . $user->id,
            );

            $user->update([
                'nequi_phone' => $request->phone,
                'nequi_payment_source_id' => (string) $sourceId,
                'nequi_subscription_active' => false, // Se activa cuando Wompi confirme via webhook
            ]);

            flash_success('¡Listo! Abre tu app Nequi y acepta la notificación de autorización. Después de eso, los pagos mensuales se cobrarán automáticamente sin que tengas que hacer nada más.');
        } catch (\Exception $e) {
            Log::error('NequiController::link error', ['user_id' => $user->id, 'message' => $e->getMessage()]);
            flash_error('No se pudo conectar con Nequi: ' . $e->getMessage());
        }

        return back();
    }

    /**
     * Desvincular Nequi del perfil del responsable.
     */
    public function unlink()
    {
        $user = Auth::user();

        $user->update([
            'nequi_phone' => null,
            'nequi_payment_source_id' => null,
            'nequi_subscription_active' => false,
        ]);

        flash_success('Tu cuenta Nequi ha sido desvinculada. Ya no se realizarán cobros automáticos.');

        return back();
    }

    /**
     * Ejecutar un cobro Nequi manual sobre un pago pendiente.
     * Solo para admins / pruebas.
     */
    public function charge(Payment $payment)
    {
        $this->authorize('update', $payment);

        $student = $payment->student;
        $responsible = $student->getPaymentResponsible();

        if (!$responsible->nequi_payment_source_id || !$responsible->nequi_subscription_active) {
            flash_error('El responsable no tiene Nequi vinculado.');
            return back();
        }

        try {
            $transaction = $this->wompiService->chargeNequi(
                phone: $responsible->nequi_phone,
                amountInCents: (int) ($payment->amount * 100),
                reference: 'KAIROS-PAY-' . $payment->id . '-' . time(),
                customerEmail: $responsible->email,
            );

            $payment->update([
                'payment_method' => 'nequi',
                'transaction_id' => $transaction['id'] ?? null,
                'notes' => ($payment->notes ?? '') . ' [Cobro Nequi enviado]',
            ]);

            $statusMsg = match ($transaction['status'] ?? '') {
                'APPROVED' => 'Pago aprobado por Nequi.',
                'PENDING' => 'Se envió la notificación a Nequi. El pago quedará pendiente hasta que el usuario acepte.',
                default => 'Cobro Nequi en proceso.',
            };

            flash_success($statusMsg);
        } catch (\Exception $e) {
            Log::error('NequiController::charge error', ['payment_id' => $payment->id, 'message' => $e->getMessage()]);
            flash_error('Error al procesar el cobro Nequi: ' . $e->getMessage());
        }

        return back();
    }
}
