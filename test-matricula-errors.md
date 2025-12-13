# Guía de Prueba - Errores de Matrícula

## Prueba 1: Errores de Validación

1. Abre el navegador en: http://localhost/KAIROS/public/matricula
2. **NO llenes ningún campo**
3. Intenta avanzar o enviar el formulario
4. **Resultado esperado**:
   - Banner rojo en la parte superior con lista de errores
   - Mensajes de error debajo de cada campo vacío en rojo

## Prueba 2: Error de Email Duplicado

1. Llena todos los campos correctamente
2. Usa un email que YA existe en la base de datos
3. Envía el formulario
4. **Resultado esperado**:
   - Banner rojo con error "Este correo electrónico ya está registrado"
   - Campo de email marcado con error

## Prueba 3: Error en el Servicio (Exception)

1. Llena todos los campos correctamente con datos NUEVOS
2. Si hay un error al guardar en la base de datos (ejemplo: tabla no existe)
3. **Resultado esperado**:
   - Toast (notificación flotante) en la esquina superior derecha con el mensaje de error
   - El formulario permanece con los datos que ingresaste

## Debugging

Abre la consola del navegador (F12 → Console) y verás:
- `🔍 Errors actualizados:` cada vez que cambian los errores
- `❌ onError callback ejecutado` cuando hay errores de validación
- Los errores completos en formato JSON

## Nota Importante

HAY DOS TIPOS DE ERRORES DIFERENTES:
1. **Errores de Validación** (FormRequest) → Banner rojo + errores inline
2. **Errores de Excepción** (try-catch) → Toast flotante

¿Cuál de los dos NO se está mostrando?
