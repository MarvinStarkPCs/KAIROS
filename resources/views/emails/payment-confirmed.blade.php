<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Pago</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4F46E5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-radius: 0 0 8px 8px;
        }
        .info-box {
            background-color: white;
            border-left: 4px solid #4F46E5;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-box strong {
            color: #4F46E5;
        }
        .highlight {
            background-color: #FEF3C7;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            border-left: 4px solid #F59E0B;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #6b7280;
        }
        .button {
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>¡Pago Confirmado!</h1>
    </div>

    <div class="content">
        <p>Estimado/a <strong>{{ $studentName }}</strong>,</p>

        <p>Nos complace confirmar que hemos recibido exitosamente tu pago por concepto de:</p>

        <div class="info-box">
            <p><strong>Programa:</strong> {{ $programName }}</p>
            <p><strong>Concepto:</strong> {{ $payment->concept }}</p>
            <p><strong>Monto:</strong> ${{ $amount }} COP</p>
            <p><strong>Fecha de pago:</strong> {{ $paymentDate }}</p>
            @if($payment->reference_number)
            <p><strong>Referencia:</strong> {{ $payment->reference_number }}</p>
            @endif
        </div>

        <div class="highlight">
            <h3 style="margin-top: 0; color: #92400E;">📅 Fecha de Inicio de Clases</h3>
            <p style="margin: 0;">
                Tu fecha de inicio de clases está programada para el
                <strong>{{ $startDateFormatted }}</strong>,
                lo que corresponde a <strong>5 días hábiles</strong> a partir de la fecha de tu pago.
            </p>
        </div>

        <p>A partir de esa fecha, podrás acceder a todas las actividades y beneficios de tu programa.</p>

        <h3>Próximos Pasos:</h3>
        <ul>
            <li>Revisa tu correo electrónico para recibir información adicional sobre el programa</li>
            <li>Accede a la plataforma con tus credenciales</li>
            <li>Consulta los horarios de clases disponibles</li>
        </ul>

        <p>Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos.</p>

        <p style="margin-top: 30px;">
            <strong>¡Bienvenido/a a KAIROS!</strong><br>
            Estamos emocionados de ser parte de tu camino musical.
        </p>
    </div>

    <div class="footer">
        <p>Este es un correo automático, por favor no responder a este mensaje.</p>
        <p>&copy; {{ date('Y') }} KAIROS. Todos los derechos reservados.</p>
    </div>
</body>
</html>
