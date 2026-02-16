@extends('emails.layout')

@section('title', 'Recordatorio de Pago')
@section('subtitle', '📋 Recordatorio de Pago')

@section('content')
    <p style="font-size: 16px; color: #111827; margin: 0 0 20px 0; line-height: 1.6;">
        Estimado/a <strong>{{ $recipientName }}</strong>,
    </p>

    <p style="font-size: 15px; color: #374151; margin: 0 0 20px 0; line-height: 1.6;">
        @if($daysUntilDue > 0)
            Le recordamos que tiene un pago pendiente que vence en <strong>{{ $daysUntilDue }} día(s)</strong>.
        @else
            Le recordamos que tiene un pago que <strong>vence hoy</strong>.
        @endif
    </p>

    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 20px;">
        <tr>
            <td style="padding: 15px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Estudiante:</p>
                <p style="margin: 0 0 12px 0; font-size: 15px; color: #111827; font-weight: 600;">{{ $studentName }}</p>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Programa:</p>
                <p style="margin: 0 0 12px 0; font-size: 15px; color: #111827; font-weight: 600;">{{ $programName }}</p>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Concepto:</p>
                <p style="margin: 0 0 12px 0; font-size: 15px; color: #111827; font-weight: 600;">{{ $payment->concept }}</p>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Monto pendiente:</p>
                <p style="margin: 0 0 12px 0; font-size: 18px; color: #92400e; font-weight: 700;">${{ $amount }} COP</p>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Fecha de vencimiento:</p>
                <p style="margin: 0; font-size: 15px; color: #111827; font-weight: 600;">{{ $dueDateFormatted }}</p>
            </td>
        </tr>
    </table>

    @if($daysUntilDue <= 0)
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px; margin-bottom: 20px;">
        <tr>
            <td style="padding: 15px;">
                <p style="margin: 0; font-size: 14px; color: #991b1b; line-height: 1.5;">
                    <strong>⚠️ Importante:</strong> Si el pago no se realiza antes de la fecha de vencimiento,
                    puede generarse un recargo o la suspensión temporal del servicio.
                </p>
            </td>
        </tr>
    </table>
    @endif

    <p style="font-size: 15px; color: #374151; margin: 0 0 15px 0; line-height: 1.6;">
        Puede realizar el pago a través de los medios habilitados o comunicándose con nosotros para más información.
    </p>

    <p style="font-size: 15px; color: #374151; margin: 0; line-height: 1.6;">
        Si ya realizó el pago, por favor ignore este mensaje.
    </p>
@endsection
