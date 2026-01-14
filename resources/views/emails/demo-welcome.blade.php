<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a Academia Linaje</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 800px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);">

                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding: 50px 40px 40px 40px;">
                            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px 50px; border-radius: 16px; display: inline-block; box-shadow: 0 8px 24px rgba(245, 158, 11, 0.35);">
                                <h1 style="color: white; margin: 0; font-size: 36px; font-weight: bold;">🎵 Academia Linaje</h1>
                                <p style="color: rgba(255, 255, 255, 0.95); margin: 10px 0 0 0; font-size: 18px;">Tu Pasión Musical Empieza Aquí</p>
                            </div>
                        </td>
                    </tr>

                    <!-- Badge -->
                    <tr>
                        <td align="center" style="padding: 0 40px 30px 40px;">
                            <div style="background: #f59e0b; display: inline-block; padding: 14px 35px; border-radius: 30px;">
                                <p style="margin: 0; color: white; font-weight: bold; font-size: 15px; text-transform: uppercase; letter-spacing: 1.5px;">✨ Clase Demo 100% GRATIS ✨</p>
                            </div>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 0 40px 40px 40px;">
                            <h2 style="color: #111827; font-size: 30px; margin: 0 0 20px 0; text-align: center; font-weight: bold;">¡Felicidades {{ $lead->name }}! 🎉</h2>

                            <p style="font-size: 19px; color: #374151; margin: 0 0 35px 0; text-align: center; line-height: 1.7;">
                                Estás a <strong style="color: #f59e0b;">un paso</strong> de descubrir tu potencial musical en <strong style="color: #f59e0b;">{{ $lead->instrument }}</strong>
                            </p>

                            <!-- Value Proposition -->
                            <div style="background: #fffbeb; padding: 40px; border-radius: 16px; margin-bottom: 35px; text-align: center; border: 2px solid #f59e0b;">
                                <p style="font-size: 24px; color: #92400e; margin: 0 0 15px 0; font-weight: bold;">⏰ Próximos Pasos</p>
                                <p style="font-size: 18px; color: #78350f; margin: 0; line-height: 1.7;">
                                    Nuestro equipo de expertos te contactará en las próximas <strong style="background: #fef3c7; padding: 4px 12px; border-radius: 6px;">24 horas</strong> para agendar tu clase personalizada.
                                </p>
                            </div>

                            <!-- What You'll Get -->
                            <div style="background: #fafafa; padding: 35px; border-radius: 16px; margin-bottom: 35px; border: 1px solid #e5e7eb;">
                                <h3 style="color: #111827; margin: 0 0 25px 0; text-align: center; font-size: 22px;">🎁 Tu Clase Demo Incluye:</h3>
                                <table style="width: 100%;">
                                    <tr>
                                        <td style="padding: 12px 15px; vertical-align: top; width: 50%;">
                                            <p style="margin: 0; color: #374151; font-size: 17px;">✓ <strong>Clase individual personalizada</strong></p>
                                        </td>
                                        <td style="padding: 12px 15px; vertical-align: top; width: 50%;">
                                            <p style="margin: 0; color: #374151; font-size: 17px;">✓ <strong>Evaluación profesional</strong></p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 15px; vertical-align: top;">
                                            <p style="margin: 0; color: #374151; font-size: 17px;">✓ <strong>Plan de aprendizaje único</strong></p>
                                        </td>
                                        <td style="padding: 12px 15px; vertical-align: top;">
                                            <p style="margin: 0; color: #374151; font-size: 17px;">✓ <strong>Sin compromiso</strong></p>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Contact Info -->
                            <table style="width: 100%; border-collapse: collapse; background: #fafafa; border-radius: 12px; overflow: hidden; margin-bottom: 35px; border: 2px solid #e5e7eb;">
                                <tr>
                                    <td colspan="2" style="padding: 22px; background: #111827; text-align: center;">
                                        <p style="margin: 0; color: white; font-size: 18px; font-weight: bold;">📋 Confirmamos tus Datos</p>
                                    </td>
                                </tr>
                                <tr style="border-bottom: 1px solid #e5e7eb;">
                                    <td style="padding: 20px 30px; color: #6b7280; font-size: 17px; width: 35%; font-weight: 600;">📧 Email:</td>
                                    <td style="padding: 20px 30px; color: #111827; font-size: 17px;">{{ $lead->email }}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #e5e7eb;">
                                    <td style="padding: 20px 30px; color: #6b7280; font-size: 17px; font-weight: 600;">📱 Teléfono:</td>
                                    <td style="padding: 20px 30px; color: #111827; font-size: 17px;">{{ $lead->phone }}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #e5e7eb;">
                                    <td style="padding: 20px 30px; color: #6b7280; font-size: 17px; font-weight: 600;">🎼 Instrumento:</td>
                                    <td style="padding: 20px 30px; color: #f59e0b; font-size: 17px; font-weight: bold;">{{ $lead->instrument }}</td>
                                </tr>
                                @if($lead->preferred_schedule)
                                <tr>
                                    <td style="padding: 20px 30px; color: #6b7280; font-size: 17px; font-weight: 600;">🕐 Horario:</td>
                                    <td style="padding: 20px 30px; color: #111827; font-size: 17px;">{{ $lead->preferred_schedule }}</td>
                                </tr>
                                @endif
                            </table>

                            <!-- Social Proof -->
                            <div style="background: #fffbeb; padding: 30px; border-radius: 12px; margin-bottom: 35px; text-align: center; border-left: 5px solid #f59e0b;">
                                <p style="margin: 0; color: #92400e; font-size: 19px; font-style: italic; line-height: 1.7;">
                                    "Miles de estudiantes ya han transformado su vida a través de la música con nosotros"
                                </p>
                                <p style="margin: 12px 0 0 0; color: #78350f; font-size: 15px; font-weight: bold;">⭐⭐⭐⭐⭐ Academia Linaje</p>
                            </div>

                            <!-- CTA -->
                            <div style="text-align: center; margin: 45px 0 35px 0;">
                                <a href="{{ config('app.url') }}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px 65px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 18px; box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4); text-transform: uppercase; letter-spacing: 1px;">🚀 Conoce Más de Nosotros</a>
                            </div>

                            <!-- Urgency -->
                            <div style="background: #fffbeb; padding: 22px 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; border: 1px solid #fbbf24;">
                                <p style="margin: 0; color: #92400e; font-size: 16px; font-weight: 600;">
                                    ⚡ <strong>Importante:</strong> Los cupos para clases demo son limitados. ¡Prepárate para tu experiencia musical!
                                </p>
                            </div>

                            <!-- Footer Note -->
                            <div style="background: #fafafa; padding: 28px; border-radius: 10px; text-align: center; border: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 12px 0; color: #111827; font-size: 18px; font-weight: bold;">¿Necesitas ayuda?</p>
                                <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                                    Estamos aquí para ti. Responde este correo o contáctanos:<br>
                                    <strong style="color: #f59e0b; font-size: 18px;">📞 +57 (123) 456-7890</strong>
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Signature -->
                    <tr>
                        <td style="padding: 35px 40px; text-align: center; background: linear-gradient(180deg, #ffffff 0%, #fffbeb 100%);">
                            <p style="margin: 0 0 8px 0; color: #111827; font-size: 18px; font-weight: bold;">🎵 La música es el lenguaje del alma</p>
                            <p style="margin: 0 0 15px 0; color: #78350f; font-size: 16px;">¡Nos vemos pronto en tu clase!</p>
                            <p style="margin: 0; color: #f59e0b; font-weight: bold; font-size: 17px;">El equipo de Academia Linaje 🎼</p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 28px 40px; border-top: 2px solid #e5e7eb; text-align: center; background: #fafafa;">
                            <p style="color: #9ca3af; font-size: 13px; margin: 0; line-height: 1.6;">
                                Este correo fue enviado porque solicitaste una clase demo gratuita.<br>
                                Academia Linaje - Transformando vidas a través de la música desde 2020
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
