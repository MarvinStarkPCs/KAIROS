@extends('emails.layout')

@section('title', 'Confirmación de Pago')
@section('subtitle', '¡Pago Confirmado!')

@section('content')
    <p style="font-size: 16px; color: #111827; margin: 0 0 20px 0; line-height: 1.6;">
        Estimado/a <strong>{{ $studentName }}</strong>,
    </p>

    <p style="font-size: 15px; color: #374151; margin: 0 0 20px 0; line-height: 1.6;">
        Nos complace confirmar que hemos recibido exitosamente tu pago por concepto de:
    </p>

    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 20px;">
        <tr>
            <td style="padding: 15px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Programa:</p>
                <p style="margin: 0 0 12px 0; font-size: 15px; color: #111827; font-weight: 600;">{{ $programName }}</p>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Concepto:</p>
                <p style="margin: 0 0 12px 0; font-size: 15px; color: #111827; font-weight: 600;">{{ $payment->concept }}</p>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Monto:</p>
                <p style="margin: 0 0 12px 0; font-size: 15px; color: #111827; font-weight: 600;">${{ $amount }} COP</p>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Fecha de pago:</p>
                <p style="margin: 0; font-size: 15px; color: #111827; font-weight: 600;">{{ $paymentDate }}</p>
                @if($payment->reference_number)
                <p style="margin: 12px 0 8px 0; font-size: 14px; color: #6b7280;">Referencia:</p>
                <p style="margin: 0; font-size: 15px; color: #111827; font-weight: 600;">{{ $payment->reference_number }}</p>
                @endif
            </td>
        </tr>
    </table>

    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 20px;">
        <tr>
            <td style="padding: 15px;">
                <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #92400e;">📅 Fecha de Inicio de Clases</p>
                <p style="margin: 0; font-size: 14px; color: #78350f; line-height: 1.5;">
                    Tu fecha de inicio de clases está programada para el
                    <strong>{{ $startDateFormatted }}</strong>,
                    lo que corresponde a <strong>5 días hábiles</strong> a partir de la fecha de tu pago.
                </p>
            </td>
        </tr>
    </table>

    <p style="font-size: 15px; color: #374151; margin: 0 0 15px 0; line-height: 1.6;">
        A partir de esa fecha, podrás acceder a todas las actividades y beneficios de tu programa.
    </p>

    <p style="font-size: 15px; color: #111827; font-weight: 600; margin: 0 0 10px 0;">Próximos Pasos:</p>
    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #374151;">✅ Revisa tu correo electrónico para recibir información adicional sobre el programa</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #374151;">✅ Accede a la plataforma con tus credenciales</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #374151;">✅ Consulta los horarios de clases disponibles</td>
        </tr>
    </table>

    <p style="font-size: 15px; color: #374151; margin: 0; line-height: 1.6;">
        Si tienes alguna pregunta, escríbenos al WhatsApp <a href="https://wa.me/573004218146" style="color:#d97706;">300 421 8146</a> o al correo <a href="mailto:Linajeacademia@gmail.com" style="color:#d97706;">Linajeacademia@gmail.com</a>.
    </p>
@endsection
