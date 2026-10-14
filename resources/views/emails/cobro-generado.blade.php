@extends('emails.layout')

@section('title', 'Nuevo cobro')
@section('subtitle', '🧾 Nuevo cobro de mensualidad')

@section('content')
    <p style="font-size: 16px; color: #111827; margin: 0 0 20px 0; line-height: 1.6;">
        Estimado/a <strong>{{ $recipientName }}</strong>,
    </p>

    <p style="font-size: 15px; color: #374151; margin: 0 0 20px 0; line-height: 1.6;">
        Se generó el cobro de la mensualidad de <strong>{{ $studentName }}</strong> en el programa <strong>{{ $programName }}</strong>.
    </p>

    {{-- Valor destacado --}}
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 20px;">
        <tr>
            <td style="padding: 15px;">
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #92400e; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Valor a pagar</p>
                <p style="margin: 0; font-size: 30px; color: #92400e; font-weight: 800;">${{ $amount }} COP</p>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #78350f;">Fecha límite: {{ $dueDateFormatted }}</p>
            </td>
        </tr>
    </table>

    {{-- Detalle --}}
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
                </table>
            </td>
        </tr>
    </table>

    @if($isOverdue)
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px; margin-bottom: 20px;">
        <tr>
            <td style="padding: 15px;">
                <p style="margin: 0; font-size: 14px; color: #991b1b; line-height: 1.5;">
                    <strong>Importante:</strong> la fecha límite de este cobro ya pasó. Le agradecemos ponerse al día lo antes posible.
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
