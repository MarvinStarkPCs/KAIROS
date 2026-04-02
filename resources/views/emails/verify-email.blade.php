@extends('emails.layout')

@section('title', 'Confirma tu correo electrónico')
@section('subtitle', '✉️ Confirma tu correo')

@section('content')
    <p style="font-size: 16px; color: #111827; margin: 0 0 20px 0; line-height: 1.6;">
        Hola <strong>{{ $user->name }} {{ $user->last_name ?? '' }}</strong>,
    </p>

    <p style="font-size: 15px; color: #374151; margin: 0 0 24px 0; line-height: 1.6;">
        Gracias por registrarte en <strong>Academia Linaje</strong>. Para activar tu cuenta
        y acceder al sistema, necesitas confirmar tu dirección de correo electrónico.
    </p>

    {{-- Botón de verificación --}}
    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
            <td align="center">
                <a href="{{ $verificationUrl }}"
                   style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4); letter-spacing: 0.3px;">
                    ✅ Confirmar mi correo
                </a>
            </td>
        </tr>
    </table>

    {{-- Aviso de expiración --}}
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 24px;">
        <tr>
            <td style="padding: 12px 16px;">
                <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
                    ⏳ Este enlace expirará en <strong>60 minutos</strong>. Si no lo usas a tiempo,
                    puedes solicitar uno nuevo desde la página de verificación.
                </p>
            </td>
        </tr>
    </table>

    {{-- Enlace alternativo --}}
    <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px 0; line-height: 1.6;">
        Si el botón no funciona, copia y pega este enlace en tu navegador:
    </p>
    <p style="font-size: 12px; color: #9ca3af; word-break: break-all; margin: 0 0 20px 0; background: #f9fafb; padding: 10px; border-radius: 6px;">
        {{ $verificationUrl }}
    </p>

    <p style="font-size: 14px; color: #6b7280; margin: 0; line-height: 1.6;">
        Si no creaste una cuenta en Academia Linaje, puedes ignorar este mensaje.
    </p>
@endsection
