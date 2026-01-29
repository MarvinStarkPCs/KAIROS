<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Matrícula Confirmada - Pago Pendiente</title>
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
            background-color: #16A34A;
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
            border-left: 4px solid #16A34A;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-box strong {
            color: #16A34A;
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
    </style>
</head>
<body>
    <div class="header">
        <h1>¡Ya estás matriculado/a!</h1>
    </div>

    <div class="content">
        <p>Estimado/a <strong>{{ $studentName }}</strong>,</p>

        <p>Tu matrícula ha sido registrada exitosamente en el siguiente programa:</p>

        <div class="info-box">
            <p><strong>Programa:</strong> {{ $programName }}</p>
            <p><strong>Concepto:</strong> {{ $payment->concept }}</p>
            <p><strong>Monto a pagar:</strong> ${{ $amount }} COP</p>
        </div>

        @if($studentSchedule)
        <div style="background-color: white; border-left: 4px solid #4F46E5; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #4F46E5;">📅 Tu Horario de Clases</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                    <td style="padding: 6px 0; color: #6b7280; width: 100px;">Grupo:</td>
                    <td style="padding: 6px 0; font-weight: 600;">{{ $studentSchedule->name }}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #6b7280;">Días:</td>
                    <td style="padding: 6px 0; font-weight: 600;">{{ ucfirst(str_replace(',', ', ', $studentSchedule->days_of_week)) }}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #6b7280;">Horario:</td>
                    <td style="padding: 6px 0; font-weight: 600;">{{ \Carbon\Carbon::parse($studentSchedule->start_time)->format('g:i A') }} - {{ \Carbon\Carbon::parse($studentSchedule->end_time)->format('g:i A') }}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #6b7280;">Profesor:</td>
                    <td style="padding: 6px 0; font-weight: 600;">{{ $studentSchedule->professor?->name ?? 'Por asignar' }}</td>
                </tr>
                @if($studentSchedule->classroom)
                <tr>
                    <td style="padding: 6px 0; color: #6b7280;">Aula:</td>
                    <td style="padding: 6px 0; font-weight: 600;">{{ $studentSchedule->classroom }}</td>
                </tr>
                @endif
            </table>
        </div>
        @endif

        <div class="highlight">
            <h3 style="margin-top: 0; color: #92400E;">💰 Pago Pendiente</h3>
            <p style="margin: 0;">
                Para completar tu proceso de matrícula, <strong>acércate a nuestras instalaciones</strong> para realizar el pago
                por transferencia bancaria o en efectivo.
            </p>
        </div>

        <p>Si tienes alguna pregunta o necesitas más información, no dudes en contactarnos. Un asesor también se comunicará contigo para coordinar los detalles.</p>

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
