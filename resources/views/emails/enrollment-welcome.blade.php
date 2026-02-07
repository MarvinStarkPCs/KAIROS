<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a KAIROS</title>
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
        .student-card {
            background-color: white;
            border-left: 4px solid #4F46E5;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
        .student-card h4 {
            margin-top: 0;
            color: #4F46E5;
        }
        .schedule-box {
            background-color: #f0f4ff;
            padding: 10px 15px;
            border-radius: 4px;
            margin-top: 10px;
        }
        .password-box {
            background-color: #FEF3C7;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
            text-align: center;
            border: 2px solid #F59E0B;
        }
        .btn {
            display: inline-block;
            background-color: #16A34A;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            font-size: 16px;
            margin-top: 10px;
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
        <h1>¡Bienvenido/a a KAIROS!</h1>
        <p style="margin: 0; opacity: 0.9;">Tu matrícula ha sido registrada exitosamente</p>
    </div>

    <div class="content">
        <p>Estimado/a <strong>{{ $responsibleName }}</strong>,</p>

        @if(!$isMinor)
            {{-- ADULTO: Datos de su propia matrícula --}}
            <p>Tu matrícula ha sido registrada exitosamente. A continuación encontrarás los detalles:</p>

            @foreach($studentsData as $student)
            <div class="info-box">
                <p><strong>Programa:</strong> {{ $student['program'] }}</p>
                <p><strong>Modalidad:</strong> {{ $student['modality'] }}</p>
                <p><strong>Valor de matrícula:</strong> ${{ $student['amount'] }} COP</p>
            </div>

            @if($student['schedule'])
            <div class="schedule-box">
                <p style="margin: 0 0 5px; font-weight: 600; color: #4F46E5;">📅 Tu Horario de Clases</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td style="padding: 4px 0; color: #6b7280; width: 80px;">Días:</td>
                        <td style="padding: 4px 0; font-weight: 600;">{{ ucfirst(str_replace(',', ', ', $student['schedule']->days_of_week)) }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0; color: #6b7280;">Horario:</td>
                        <td style="padding: 4px 0; font-weight: 600;">{{ \Carbon\Carbon::parse($student['schedule']->start_time)->format('g:i A') }} - {{ \Carbon\Carbon::parse($student['schedule']->end_time)->format('g:i A') }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0; color: #6b7280;">Profesor:</td>
                        <td style="padding: 4px 0; font-weight: 600;">{{ $student['schedule']->professor?->name ?? 'Por asignar' }}</td>
                    </tr>
                </table>
            </div>
            @endif
            @endforeach

        @else
            {{-- RESPONSABLE DE MENORES: Datos de sus hijos --}}
            <p>La matrícula de {{ count($studentsData) > 1 ? 'tus hijos ha' : 'tu hijo/a ha' }} sido registrada exitosamente. A continuación encontrarás los detalles:</p>

            @foreach($studentsData as $index => $student)
            <div class="student-card">
                <h4>👤 {{ $student['name'] }}</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td style="padding: 4px 0; color: #6b7280; width: 100px;">Programa:</td>
                        <td style="padding: 4px 0; font-weight: 600;">{{ $student['program'] }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0; color: #6b7280;">Modalidad:</td>
                        <td style="padding: 4px 0; font-weight: 600;">{{ $student['modality'] }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0; color: #6b7280;">Valor:</td>
                        <td style="padding: 4px 0; font-weight: 600;">${{ $student['amount'] }} COP</td>
                    </tr>
                </table>

                @if($student['schedule'])
                <div class="schedule-box">
                    <p style="margin: 0 0 5px; font-weight: 600; font-size: 13px;">📅 Horario de Clases</p>
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <tr>
                            <td style="padding: 3px 0; color: #6b7280; width: 80px;">Días:</td>
                            <td style="padding: 3px 0; font-weight: 600;">{{ ucfirst(str_replace(',', ', ', $student['schedule']->days_of_week)) }}</td>
                        </tr>
                        <tr>
                            <td style="padding: 3px 0; color: #6b7280;">Horario:</td>
                            <td style="padding: 3px 0; font-weight: 600;">{{ \Carbon\Carbon::parse($student['schedule']->start_time)->format('g:i A') }} - {{ \Carbon\Carbon::parse($student['schedule']->end_time)->format('g:i A') }}</td>
                        </tr>
                        <tr>
                            <td style="padding: 3px 0; color: #6b7280;">Profesor:</td>
                            <td style="padding: 3px 0; font-weight: 600;">{{ $student['schedule']->professor?->name ?? 'Por asignar' }}</td>
                        </tr>
                    </table>
                </div>
                @endif
            </div>
            @endforeach
        @endif

        {{-- Sección de establecer contraseña --}}
        <div class="password-box">
            <h3 style="margin-top: 0; color: #92400E;">🔐 Establece tu contraseña</h3>
            <p style="margin: 0 0 15px; color: #78350F;">
                Para acceder a la plataforma, necesitas establecer tu contraseña. Tu correo de acceso es: <strong>{{ $email }}</strong>
            </p>
            <a href="{{ $resetUrl }}" class="btn">Establecer mi contraseña</a>
            <p style="margin: 15px 0 0; font-size: 12px; color: #92400E;">
                Este enlace expirará en {{ config('auth.passwords.users.expire', 60) }} minutos.
            </p>
        </div>

        <p>Si tienes alguna pregunta o necesitas más información, no dudes en contactarnos.</p>

        <p style="margin-top: 30px;">
            <strong>¡Bienvenido/a a la familia KAIROS!</strong><br>
            Estamos emocionados de ser parte de tu camino musical.
        </p>
    </div>

    <div class="footer">
        <p>Este es un correo automático, por favor no responder a este mensaje.</p>
        <p>&copy; {{ date('Y') }} KAIROS. Todos los derechos reservados.</p>
    </div>
</body>
</html>
