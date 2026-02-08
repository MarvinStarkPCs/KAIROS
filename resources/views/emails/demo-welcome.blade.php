@extends('emails.layout')

@section('title', 'Clase Demo Gratuita - Academia Linaje')
@section('subtitle', 'Clase Demo 100% GRATIS')

@section('content')
    <p style="font-size: 22px; color: #111827; margin: 0 0 15px 0; text-align: center; font-weight: bold;">
        ¡Felicidades {{ $lead->name }}! 🎉
    </p>

    <p style="font-size: 16px; color: #374151; margin: 0 0 25px 0; text-align: center; line-height: 1.7;">
        Estás a <strong style="color: #f59e0b;">un paso</strong> de descubrir tu potencial musical en <strong style="color: #f59e0b;">{{ $lead->instrument }}</strong>
    </p>

    {{-- Próximos Pasos --}}
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fffbeb; border: 2px solid #f59e0b; border-radius: 12px; margin-bottom: 25px;">
        <tr>
            <td align="center" style="padding: 25px;">
                <p style="font-size: 20px; color: #92400e; margin: 0 0 10px 0; font-weight: bold;">⏰ Próximos Pasos</p>
                <p style="font-size: 15px; color: #78350f; margin: 0; line-height: 1.7;">
                    Nuestro equipo de expertos te contactará en las próximas <strong style="background: #fef3c7; padding: 2px 8px; border-radius: 4px;">24 horas</strong> para agendar tu clase personalizada.
                </p>
            </td>
        </tr>
    </table>

    {{-- Qué incluye --}}
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fafafa; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 25px;">
        <tr>
            <td style="padding: 25px;">
                <p style="color: #111827; margin: 0 0 18px 0; text-align: center; font-size: 18px; font-weight: bold;">🎁 Tu Clase Demo Incluye:</p>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 10px; vertical-align: top; width: 50%;">
                            <p style="margin: 0; color: #374151; font-size: 14px;">✓ <strong>Clase individual personalizada</strong></p>
                        </td>
                        <td style="padding: 8px 10px; vertical-align: top; width: 50%;">
                            <p style="margin: 0; color: #374151; font-size: 14px;">✓ <strong>Evaluación profesional</strong></p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 10px; vertical-align: top;">
                            <p style="margin: 0; color: #374151; font-size: 14px;">✓ <strong>Plan de aprendizaje único</strong></p>
                        </td>
                        <td style="padding: 8px 10px; vertical-align: top;">
                            <p style="margin: 0; color: #374151; font-size: 14px;">✓ <strong>Sin compromiso</strong></p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- Datos del lead --}}
    <table role="presentation" style="width: 100%; border-collapse: collapse; border-radius: 10px; overflow: hidden; margin-bottom: 25px; border: 1px solid #e5e7eb;">
        <tr>
            <td colspan="2" style="padding: 16px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); text-align: center;">
                <p style="margin: 0; color: white; font-size: 16px; font-weight: bold;">📋 Confirmamos tus Datos</p>
            </td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 14px 20px; color: #6b7280; font-size: 14px; width: 35%; font-weight: 600; background-color: #fafafa;">📧 Email:</td>
            <td style="padding: 14px 20px; color: #111827; font-size: 14px; background-color: #fafafa;">{{ $lead->email }}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 14px 20px; color: #6b7280; font-size: 14px; font-weight: 600; background-color: #ffffff;">📱 Teléfono:</td>
            <td style="padding: 14px 20px; color: #111827; font-size: 14px; background-color: #ffffff;">{{ $lead->phone }}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 14px 20px; color: #6b7280; font-size: 14px; font-weight: 600; background-color: #fafafa;">🎼 Instrumento:</td>
            <td style="padding: 14px 20px; color: #f59e0b; font-size: 14px; font-weight: bold; background-color: #fafafa;">{{ $lead->instrument }}</td>
        </tr>
        @if($lead->preferred_schedule)
        <tr>
            <td style="padding: 14px 20px; color: #6b7280; font-size: 14px; font-weight: 600; background-color: #ffffff;">🕐 Horario:</td>
            <td style="padding: 14px 20px; color: #111827; font-size: 14px; background-color: #ffffff;">{{ $lead->preferred_schedule }}</td>
        </tr>
        @endif
    </table>

    {{-- Social Proof --}}
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fffbeb; border-left: 5px solid #f59e0b; border-radius: 8px; margin-bottom: 25px;">
        <tr>
            <td align="center" style="padding: 20px;">
                <p style="margin: 0 0 8px 0; color: #92400e; font-size: 15px; font-style: italic; line-height: 1.7;">
                    "Miles de estudiantes ya han transformado su vida a través de la música con nosotros"
                </p>
                <p style="margin: 0; color: #78350f; font-size: 13px; font-weight: bold;">⭐⭐⭐⭐⭐ Academia Linaje</p>
            </td>
        </tr>
    </table>

    {{-- CTA --}}
    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <tr>
            <td align="center" style="padding: 15px 0;">
                <a href="{{ config('app.url') }}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 16px 45px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">🚀 Conoce Más de Nosotros</a>
            </td>
        </tr>
    </table>

    {{-- Urgencia --}}
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; margin-bottom: 25px;">
        <tr>
            <td align="center" style="padding: 16px 20px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
                    ⚡ <strong>Importante:</strong> Los cupos para clases demo son limitados. ¡Prepárate para tu experiencia musical!
                </p>
            </td>
        </tr>
    </table>

    {{-- Ayuda --}}
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fafafa; border: 1px solid #e5e7eb; border-radius: 8px;">
        <tr>
            <td align="center" style="padding: 20px;">
                <p style="margin: 0 0 8px 0; color: #111827; font-size: 16px; font-weight: bold;">¿Necesitas ayuda?</p>
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Estamos aquí para ti. Responde este correo o contáctanos:<br>
                    <strong style="color: #f59e0b; font-size: 16px;">📞 +57 (123) 456-7890</strong>
                </p>
            </td>
        </tr>
    </table>
@endsection
