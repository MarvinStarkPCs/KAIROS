<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Academia Linaje')</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); overflow: hidden;">

                    {{-- Header --}}
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 35px 40px;">
                            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎵 Academia Linaje</h1>
                            <p style="color: rgba(255, 255, 255, 0.9); margin: 6px 0 0 0; font-size: 14px; letter-spacing: 0.5px;">Academia Musical y Espiritual</p>
                            @hasSection('subtitle')
                            <p style="color: white; margin: 16px 0 0 0; font-size: 18px; font-weight: 600;">@yield('subtitle')</p>
                            @endif
                        </td>
                    </tr>

                    {{-- Content --}}
                    <tr>
                        <td style="padding: 40px;">
                            @yield('content')
                        </td>
                    </tr>

                    {{-- Closing --}}
                    <tr>
                        <td style="padding: 0 40px 30px 40px;">
                            <p style="margin: 0 0 16px 0; color: #111827; font-size: 15px;">
                                <strong>¡Gracias por ser parte de la familia Academia Linaje!</strong><br>
                                <span style="color: #6b7280;">Estamos emocionados de ser parte de tu camino musical. 🎶</span>
                            </p>
                            <table role="presentation" style="width:100%; border-collapse:collapse; background:#fffbeb; border-radius:8px; border:1px solid #fde68a;">
                                <tr>
                                    <td style="padding:14px 18px;">
                                        <p style="margin:0 0 6px 0; font-size:13px; color:#92400e; font-weight:700;">¿Necesitas ayuda? Contáctanos:</p>
                                        <p style="margin:0 0 4px 0; font-size:14px; color:#374151;">
                                            📞 WhatsApp: <a href="https://wa.me/573004218146" style="color:#d97706; text-decoration:none; font-weight:600;">300 421 8146</a>
                                        </p>
                                        <p style="margin:0; font-size:14px; color:#374151;">
                                            ✉️ Correo: <a href="mailto:Linajeacademia@gmail.com" style="color:#d97706; text-decoration:none; font-weight:600;">Linajeacademia@gmail.com</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="padding: 25px 40px; border-top: 2px solid #f3f4f6; background-color: #fafafa; text-align: center;">
                            <p style="color: #9ca3af; font-size: 12px; margin: 0 0 6px 0;">
                                Este es un correo automático, por favor no responder directamente a este mensaje.
                            </p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                &copy; {{ date('Y') }} Academia Linaje — <a href="https://academialinaje.com" style="color:#d97706; text-decoration:none;">academialinaje.com</a>
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
