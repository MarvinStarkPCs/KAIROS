@extends('emails.layout')

@section('title', 'Matrícula Confirmada - Pago Pendiente')
@section('subtitle', '¡Ya estás matriculado/a!')

@section('content')
    <p style="font-size: 16px; color: #111827; margin: 0 0 20px 0; line-height: 1.6;">
        Estimado/a <strong>{{ $studentName }}</strong>,
    </p>

    <p style="font-size: 15px; color: #374151; margin: 0 0 20px 0; line-height: 1.6;">
        Tu matrícula ha sido registrada exitosamente en el siguiente programa:
    </p>

    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 20px;">
        <tr>
            <td style="padding: 15px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Programa:</p>
                <p style="margin: 0 0 12px 0; font-size: 15px; color: #111827; font-weight: 600;">{{ $programName }}</p>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Concepto:</p>
                <p style="margin: 0 0 12px 0; font-size: 15px; color: #111827; font-weight: 600;">{{ $payment->concept }}</p>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Monto a pagar:</p>
                <p style="margin: 0; font-size: 15px; color: #111827; font-weight: 600;">${{ $amount }} COP</p>
            </td>
        </tr>
    </table>

    @if($studentSchedule)
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fffbeb; border-radius: 8px; margin-bottom: 20px;">
        <tr>
            <td style="padding: 15px;">
                <p style="margin: 0 0 10px 0; font-weight: 600; color: #92400e; font-size: 15px;">📅 Tu Horario de Clases</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td style="padding: 6px 0; color: #6b7280; width: 100px;">Grupo:</td>
                        <td style="padding: 6px 0; font-weight: 600; color: #111827;">{{ $studentSchedule->name }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #6b7280;">Días:</td>
                        <td style="padding: 6px 0; font-weight: 600; color: #111827;">{{ ucfirst(str_replace(',', ', ', $studentSchedule->days_of_week)) }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #6b7280;">Horario:</td>
                        <td style="padding: 6px 0; font-weight: 600; color: #111827;">{{ \Carbon\Carbon::parse($studentSchedule->start_time)->format('g:i A') }} - {{ \Carbon\Carbon::parse($studentSchedule->end_time)->format('g:i A') }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #6b7280;">Profesor:</td>
                        <td style="padding: 6px 0; font-weight: 600; color: #111827;">{{ $studentSchedule->professor?->name ?? 'Por asignar' }}</td>
                    </tr>
                    @if($studentSchedule->classroom)
                    <tr>
                        <td style="padding: 6px 0; color: #6b7280;">Aula:</td>
                        <td style="padding: 6px 0; font-weight: 600; color: #111827;">{{ $studentSchedule->classroom }}</td>
                    </tr>
                    @endif
                </table>
            </td>
        </tr>
    </table>
    @endif

    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 20px;">
        <tr>
            <td style="padding: 15px;">
                <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #92400e;">💰 Pago Pendiente</p>
                <p style="margin: 0; font-size: 14px; color: #78350f; line-height: 1.5;">
                    Para completar tu proceso de matrícula, <strong>acércate a nuestras instalaciones</strong> para realizar el pago
                    por transferencia bancaria o en efectivo.
                </p>
            </td>
        </tr>
    </table>

    <p style="font-size: 15px; color: #374151; margin: 0; line-height: 1.6;">
        Si tienes alguna pregunta o necesitas más información, no dudes en contactarnos. Un asesor también se comunicará contigo para coordinar los detalles.
    </p>
@endsection
