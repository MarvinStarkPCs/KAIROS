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

    {{-- Saldo pendiente destacado --}}
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 20px;">
        <tr>
            <td style="padding: 15px;">
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #92400e; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Valor que debe pagar</p>
                <p style="margin: 0; font-size: 30px; color: #92400e; font-weight: 800;">${{ $amount }} COP</p>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #78350f;">Fecha límite: {{ $dueDateFormatted }}</p>
            </td>
        </tr>
    </table>

    {{-- Detalle del cobro --}}
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-left: 4px solid #e5e7eb; border-radius: 4px; margin-bottom: 20px;">
        <tr>
            <td style="padding: 15px;">
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #374151; font-weight: 600;">Detalle del cobro</p>

                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: #6b7280;">Estudiante:</td>
                        <td style="padding: 5px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right;">{{ $studentName }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: #6b7280;">Programa:</td>
                        <td style="padding: 5px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right;">{{ $programName }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: #6b7280;">Concepto:</td>
                        <td style="padding: 5px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right;">{{ $payment->concept }}</td>
                    </tr>

                    @if($hasPartialPayments)
                    {{-- Mostrar desglose si hay abonos --}}
                    <tr>
                        <td colspan="2" style="padding: 8px 0 4px 0; border-top: 1px solid #f3f4f6;"></td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0; font-size: 14px; color: #6b7280;">Valor total del cobro:</td>
                        <td style="padding: 4px 0; font-size: 14px; color: #6b7280; text-align: right;">${{ $totalAmount }} COP</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0; font-size: 14px; color: #16a34a;">Abonos realizados:</td>
                        <td style="padding: 4px 0; font-size: 14px; color: #16a34a; text-align: right;">- ${{ $paidAmount }} COP</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-size: 15px; color: #92400e; font-weight: 700; border-top: 1px solid #f3f4f6;">Saldo pendiente:</td>
                        <td style="padding: 6px 0; font-size: 15px; color: #92400e; font-weight: 700; text-align: right; border-top: 1px solid #f3f4f6;">${{ $amount }} COP</td>
                    </tr>
                    @endif
                </table>
            </td>
        </tr>
    </table>

    @if($daysUntilDue <= 0)
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px; margin-bottom: 20px;">
        <tr>
            <td style="padding: 15px;">
                <p style="margin: 0; font-size: 14px; color: #991b1b; line-height: 1.5;">
                    <strong>⚠️ Importante:</strong> Si el pago no se realiza hoy, puede generarse la suspensión temporal de la matrícula.
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
