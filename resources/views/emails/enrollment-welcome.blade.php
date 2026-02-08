@extends('emails.layout')

@section('title', 'Bienvenido a Academia Linaje')
@section('subtitle', 'Tu matrícula ha sido registrada exitosamente')

@section('content')
    <p style="font-size: 16px; color: #111827; margin: 0 0 20px 0; line-height: 1.6;">
        Estimado/a <strong>{{ $responsibleName }}</strong>,
    </p>

    @if(!$isMinor)
        {{-- ADULTO: Datos de su propia matrícula --}}
        <p style="font-size: 15px; color: #374151; margin: 0 0 20px 0; line-height: 1.6;">
            Tu matrícula ha sido registrada exitosamente. A continuación encontrarás los detalles:
        </p>

        @foreach($studentsData as $student)
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 20px;">
            <tr>
                <td style="padding: 15px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Programa:</p>
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #111827; font-weight: 600;">{{ $student['program'] }}</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Modalidad:</p>
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #111827; font-weight: 600;">{{ $student['modality'] }}</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Valor de matrícula:</p>
                    <p style="margin: 0; font-size: 15px; color: #111827; font-weight: 600;">${{ $student['amount'] }} COP</p>
                </td>
            </tr>
        </table>

        @if($student['schedule'])
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fffbeb; border-radius: 8px; margin-bottom: 20px;">
            <tr>
                <td style="padding: 15px;">
                    <p style="margin: 0 0 10px 0; font-weight: 600; color: #92400e; font-size: 15px;">📅 Tu Horario de Clases</p>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <tr>
                            <td style="padding: 4px 0; color: #6b7280; width: 80px;">Días:</td>
                            <td style="padding: 4px 0; font-weight: 600; color: #111827;">{{ ucfirst(str_replace(',', ', ', $student['schedule']->days_of_week)) }}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #6b7280;">Horario:</td>
                            <td style="padding: 4px 0; font-weight: 600; color: #111827;">{{ \Carbon\Carbon::parse($student['schedule']->start_time)->format('g:i A') }} - {{ \Carbon\Carbon::parse($student['schedule']->end_time)->format('g:i A') }}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #6b7280;">Profesor:</td>
                            <td style="padding: 4px 0; font-weight: 600; color: #111827;">{{ $student['schedule']->professor?->name ?? 'Por asignar' }}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        @endif
        @endforeach

    @else
        {{-- RESPONSABLE DE MENORES: Datos de sus hijos --}}
        <p style="font-size: 15px; color: #374151; margin: 0 0 20px 0; line-height: 1.6;">
            La matrícula de {{ count($studentsData) > 1 ? 'tus hijos ha' : 'tu hijo/a ha' }} sido registrada exitosamente. A continuación encontrarás los detalles:
        </p>

        @foreach($studentsData as $index => $student)
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-left: 4px solid #d97706; border-radius: 4px; margin-bottom: 20px;">
            <tr>
                <td style="padding: 15px;">
                    <p style="margin: 0 0 12px 0; font-size: 16px; color: #92400e; font-weight: bold;">👤 {{ $student['name'] }}</p>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <tr>
                            <td style="padding: 4px 0; color: #6b7280; width: 100px;">Programa:</td>
                            <td style="padding: 4px 0; font-weight: 600; color: #111827;">{{ $student['program'] }}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #6b7280;">Modalidad:</td>
                            <td style="padding: 4px 0; font-weight: 600; color: #111827;">{{ $student['modality'] }}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #6b7280;">Valor:</td>
                            <td style="padding: 4px 0; font-weight: 600; color: #111827;">${{ $student['amount'] }} COP</td>
                        </tr>
                    </table>

                    @if($student['schedule'])
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fffbeb; border-radius: 6px; margin-top: 12px;">
                        <tr>
                            <td style="padding: 12px;">
                                <p style="margin: 0 0 8px 0; font-weight: 600; font-size: 13px; color: #92400e;">📅 Horario de Clases</p>
                                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                                    <tr>
                                        <td style="padding: 3px 0; color: #6b7280; width: 80px;">Días:</td>
                                        <td style="padding: 3px 0; font-weight: 600; color: #111827;">{{ ucfirst(str_replace(',', ', ', $student['schedule']->days_of_week)) }}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 3px 0; color: #6b7280;">Horario:</td>
                                        <td style="padding: 3px 0; font-weight: 600; color: #111827;">{{ \Carbon\Carbon::parse($student['schedule']->start_time)->format('g:i A') }} - {{ \Carbon\Carbon::parse($student['schedule']->end_time)->format('g:i A') }}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 3px 0; color: #6b7280;">Profesor:</td>
                                        <td style="padding: 3px 0; font-weight: 600; color: #111827;">{{ $student['schedule']->professor?->name ?? 'Por asignar' }}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    @endif
                </td>
            </tr>
        </table>
        @endforeach
    @endif

    {{-- Sección de establecer contraseña --}}
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fffbeb; border: 2px solid #f59e0b; border-radius: 8px; margin: 25px 0;">
        <tr>
            <td align="center" style="padding: 25px;">
                <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold; color: #92400e;">🔐 Establece tu contraseña</p>
                <p style="margin: 0 0 18px 0; color: #78350f; font-size: 14px; line-height: 1.5;">
                    Para acceder a la plataforma, necesitas establecer tu contraseña.<br>
                    Tu correo de acceso es: <strong>{{ $email }}</strong>
                </p>
                <a href="{{ $resetUrl }}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">Establecer mi contraseña</a>
                <p style="margin: 15px 0 0 0; font-size: 12px; color: #92400e;">
                    Este enlace expirará en {{ config('auth.passwords.users.expire', 60) }} minutos.
                </p>
            </td>
        </tr>
    </table>

    <p style="font-size: 15px; color: #374151; margin: 0; line-height: 1.6;">
        Si tienes alguna pregunta o necesitas más información, no dudes en contactarnos.
    </p>
@endsection
