@extends('emails.layout')

@section('title', $isPaid ? 'Pago Completado' : 'Abono Registrado')
@section('subtitle', $isPaid ? '✅ ¡Pago Completado!' : '💰 Abono Registrado')

@section('content')
    <p style="font-size: 16px; color: #111827; margin: 0 0 20px 0; line-height: 1.6;">
        Estimado/a <strong>{{ $recipientName }}</strong>,
    </p>

    <p style="font-size: 15px; color: #374151; margin: 0 0 20px 0; line-height: 1.6;">
        @if($isPaid)
            Nos complace informarle que el pago de <strong>{{ $studentName }}</strong> ha sido <strong>completado exitosamente</strong>.
        @else
            Le confirmamos que hemos registrado un abono para el estudiante <strong>{{ $studentName }}</strong>.
        @endif
    </p>

    {{-- Detalle del abono --}}
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 4px; margin-bottom: 20px;">
        <tr>
            <td style="padding: 15px;">
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #16a34a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Abono registrado</p>
                <p style="margin: 0; font-size: 26px; color: #15803d; font-weight: 800;">${{ $abonoAmount }} COP</p>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #4b5563;">Fecha: {{ $transactionDate }}</p>
                @if($referenceNumber)
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #4b5563;">Referencia: <strong>{{ $referenceNumber }}</strong></p>
                @endif
            </td>
        </tr>
    </table>

    {{-- Detalle del cobro --}}
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 20px;">
        <tr>
            <td style="padding: 15px;">
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #92400e; font-weight: 600;">Detalle del cobro</p>

                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: #6b7280;">Programa:</td>
                        <td style="padding: 5px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right;">{{ $programName }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: #6b7280;">Concepto:</td>
                        <td style="padding: 5px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right;">{{ $payment->concept }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: #6b7280; border-top: 1px solid #f3f4f6;">Valor total:</td>
                        <td style="padding: 5px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right; border-top: 1px solid #f3f4f6;">${{ $totalAmount }} COP</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: #6b7280;">Total abonado:</td>
                        <td style="padding: 5px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right;">${{ $paidAmount }} COP</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- Saldo pendiente o completado --}}
    @if($isPaid)
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 4px; margin-bottom: 20px;">
        <tr>
            <td style="padding: 15px; text-align: center;">
                <p style="margin: 0; font-size: 16px; color: #15803d; font-weight: 700;">✅ Pago completado — Saldo: $0 COP</p>
            </td>
        </tr>
    </table>
    @else
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 20px;">
        <tr>
            <td style="padding: 15px;">
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #92400e; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Saldo pendiente</p>
                <p style="margin: 0; font-size: 26px; color: #92400e; font-weight: 800;">${{ $remainingAmount }} COP</p>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #78350f;">Fecha de vencimiento: {{ $payment->due_date->locale('es')->isoFormat('D [de] MMMM [de] YYYY') }}</p>
            </td>
        </tr>
    </table>
    @endif

    <p style="font-size: 15px; color: #374151; margin: 0; line-height: 1.6;">
        Si tiene alguna pregunta sobre su pago, no dude en comunicarse con nosotros.
    </p>
@endsection
