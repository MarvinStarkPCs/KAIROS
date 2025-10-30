# Sistema de Alertas/Toast - KAIROS

## Resumen

El sistema de alertas está **completamente funcional y unificado** usando **Sonner** (librería moderna y profesional de toast). Las alertas se muestran automáticamente en todas las páginas cuando los controladores envían mensajes flash.

**Ventajas de Sonner:**
- ✅ Animaciones profesionales con spring physics
- ✅ Apilamiento inteligente de múltiples toasts
- ✅ Swipe para cerrar + hover para pausar auto-cierre
- ✅ Colores ricos y diseño accesible
- ✅ Duración de 5 segundos (óptimo para lectura)
- ✅ Librería mantenida y popular

---

## Cómo Usar en Controladores

### Método 1: Usando `with()` en redirects (Recomendado)

```php
// Mensaje de éxito
return redirect()->route('usuarios.index')
    ->with('success', 'Usuario creado exitosamente');

// Mensaje de error
return redirect()->back()
    ->with('error', 'No se puede eliminar este registro');

// Mensaje de información
return redirect()->route('dashboard')
    ->with('info', 'Se actualizó la configuración');

// Mensaje de advertencia
return redirect()->back()
    ->with('warning', 'Este cambio no se puede deshacer');
```

### Método 2: Usando funciones helper (Nuevo)

Ahora tienes funciones globales disponibles en cualquier controlador:

```php
// Mensaje de éxito
flash_success('Usuario creado exitosamente');
return redirect()->route('usuarios.index');

// Mensaje de error
flash_error('No se puede eliminar este registro');
return redirect()->back();

// Mensaje de información
flash_info('Se actualizó la configuración');

// Mensaje de advertencia
flash_warning('Este cambio no se puede deshacer');
```

---

## Tipos de Alertas Disponibles

| Tipo | Color | Icono | Cuándo usar |
|------|-------|-------|-------------|
| `success` | Verde | ✓ | Operaciones exitosas (crear, actualizar, eliminar) |
| `error` | Rojo | ✗ | Errores de validación, operaciones fallidas |
| `info` | Azul | ℹ | Información general, notificaciones |
| `warning` | Amarillo | ⚠ | Advertencias, confirmaciones importantes |

---

## Características

✅ **Configuración automática** - No necesitas agregar código en cada página
✅ **Auto-cierre inteligente** - Se cierran automáticamente después de 5 segundos
✅ **Hover para pausar** - Al pasar el mouse se pausa el auto-cierre
✅ **Swipe para cerrar** - Desliza en móvil para cerrar manualmente
✅ **Animaciones profesionales** - Spring physics con transiciones suaves
✅ **Apilamiento inteligente** - Múltiples toasts se apilan sin superponerse
✅ **Posición optimizada** - 80px desde arriba, esquina derecha
✅ **Rich colors** - Colores semánticos con diseño moderno
✅ **Type-safe** - TypeScript tipado en frontend
✅ **Responsive** - Funciona perfectamente en móvil y escritorio
✅ **Accesible** - ARIA labels y navegación por teclado

---

## Ejemplos de Uso en Controladores

### UserController.php

```php
public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string',
        'email' => 'required|email|unique:users',
    ]);

    User::create($validated);

    return redirect()->route('usuarios.index')
        ->with('success', 'Usuario creado exitosamente');
}

public function destroy(User $user)
{
    if ($user->id === auth()->id()) {
        return redirect()->back()
            ->with('error', 'No puedes eliminar tu propio usuario');
    }

    $user->delete();

    return redirect()->route('usuarios.index')
        ->with('success', 'Usuario eliminado exitosamente');
}
```

### ProgramController.php

```php
public function update(Request $request, AcademicProgram $program)
{
    $validated = $request->validate([
        'name' => 'required|string',
        'duration' => 'required|integer',
    ]);

    $program->update($validated);

    flash_success('Programa académico actualizado exitosamente');
    return redirect()->route('programas.index');
}

public function destroy(AcademicProgram $program)
{
    if ($program->enrollments()->count() > 0) {
        flash_error('No se puede eliminar el programa porque tiene estudiantes activos');
        return redirect()->back();
    }

    $program->delete();

    flash_success('Programa académico eliminado exitosamente');
    return redirect()->route('programas.index');
}
```

---

## Archivos Modificados

### Backend

1. **`app/Http/Middleware/HandleInertiaRequests.php`**
   - Comparte mensajes flash explícitamente en array `flash`

2. **`app/Helpers/FlashHelper.php`** (Nuevo)
   - Clase helper para mensajes flash

3. **`app/helpers.php`** (Nuevo)
   - Funciones globales: `flash_success()`, `flash_error()`, `flash_info()`, `flash_warning()`

4. **`composer.json`**
   - Registra `app/helpers.php` en autoload

### Frontend

1. **`resources/js/components/toaster.tsx`**
   - Componente Toaster usando Sonner
   - Lee automáticamente los mensajes flash y los muestra
   - Soporta 4 tipos: success, error, info, warning
   - Configuración: posición top-right, 80px offset, 5 segundos duración

2. **`resources/js/layouts/`** (Todos actualizados)
   - `app-header-layout.tsx` - Incluye `<Toaster />`
   - `app-sidebar-layout.tsx` - Incluye `<Toaster />`
   - `auth-simple-layout.tsx` - Incluye `<Toaster />`
   - `auth-split-layout.tsx` - Incluye `<Toaster />`
   - `auth-card-layout.tsx` - Incluye `<Toaster />`
   - `settings/layout.tsx` - Incluye `<Toaster />`

3. **`resources/js/types/index.d.ts`**
   - Interfaz `FlashMessages` con tipos TypeScript

4. **`package.json`**
   - Dependencia: `sonner@2.0.7`

---

## Configuración Avanzada

### Cambiar posición de las alertas

Edita `resources/js/components/toaster.tsx`:

```tsx
<SonnerToaster
    position="top-right"  // ← Opciones: top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
    offset="80px"         // ← Distancia desde el borde
/>
```

### Cambiar duración del auto-cierre

Edita `toaster.tsx`:

```tsx
toastOptions={{
    duration: 5000,  // ← Cambia 5000 (5 segundos) por el valor deseado
}}
```

**Duración recomendada:**
- **Éxito/Info**: 4000-5000ms (4-5 segundos)
- **Error/Warning**: 5000-7000ms (5-7 segundos) - más tiempo para leer

### Personalizar apariencia

Edita `toaster.tsx`:

```tsx
<SonnerToaster
    expand={true}      // true = muestra todos los toasts apilados
    richColors         // Colores semánticos automáticos
    closeButton        // Muestra botón X para cerrar
    theme="system"     // "light", "dark", o "system"
/>
```

### Documentación completa de Sonner

Visita: https://sonner.emilkowal.ski/

---

## Solución de Problemas

### Los mensajes no se muestran

1. Verifica que el controlador use `->with('success', 'mensaje')` o `flash_success('mensaje')`
2. Asegúrate de hacer `redirect()` (no `return Inertia::render()`)
3. Ejecuta `composer dump-autoload` si usas las funciones helper
4. Ejecuta `npm run dev` para recompilar el frontend

### Error "flash is undefined"

- El middleware `HandleInertiaRequests` debe estar registrado
- Verifica que el array `flash` esté en el método `share()` del middleware

### TypeScript muestra errores

- Ejecuta `npm run types` para verificar errores
- La interfaz `FlashMessages` debe estar en `resources/js/types/index.d.ts`

---

## Migración desde el Sistema Anterior

### Ahora (Automático con Sonner)

```tsx
// En cada página - NO NECESITAS NADA
export default function MyPage() {
    return (
        <AppLayout>
            {/* Las alertas aparecen automáticamente */}
            {/* ... contenido ... */}
        </AppLayout>
    );
}
```

El componente `<Toaster />` está en el layout global, así que **todas las páginas** muestran alertas automáticamente con las animaciones profesionales de Sonner.

---

## Mejores Prácticas

1. **Mensajes claros** - Describe lo que pasó de forma concisa
2. **Tipo correcto** - Usa `success` para confirmaciones, `error` para problemas
3. **Mensajes en español** - Toda la UI está en español
4. **Evita mensajes técnicos** - Los usuarios no necesitan ver stack traces
5. **Consistencia** - Usa las funciones helper para mantener el código limpio
6. **Tiempo prudente** - 4 segundos permite leer el mensaje sin molestar

---

## Detalles Técnicos de Sonner

### Animaciones
- **Entrada:** Spring physics con bounce suave
- **Salida:** Fade out + slide con easing natural
- **Swipe:** Detección de gestos táctiles para cerrar
- **Hover:** Pausa automática del timer al pasar el mouse

### Características Técnicas
- **Z-Index:** Muy alto (siempre visible sobre todo el contenido)
- **Portal:** Se renderiza fuera del DOM normal para evitar problemas de stacking
- **Accesibilidad:** ARIA live regions, roles semánticos, navegación por teclado
- **Performance:** Optimizado con RAF (requestAnimationFrame)
- **Multi-toast:** Apilamiento inteligente con collapse/expand automático

---

**Actualizado:** 2025-10-30
**Estado:** ✅ Totalmente funcional usando Sonner en todas las páginas
**Librería:** Sonner v2.0.7 (https://sonner.emilkowal.ski/)
