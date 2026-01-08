# Propuestas de Página Principal - Academia Linaje

He creado tres propuestas diferentes para la página principal de Academia Linaje. Todas mantienen la paleta de colores amber/orange existente y destacan prominentemente la **clase gratuita** como oferta principal.

## Cómo visualizar las propuestas

Una vez que el servidor de desarrollo esté corriendo (`composer dev`), puedes acceder a cada propuesta en:

- **Propuesta 1**: http://localhost:8000/propuesta-1
- **Propuesta 2**: http://localhost:8000/propuesta-2
- **Propuesta 3**: http://localhost:8000/propuesta-3

---

## 📋 Propuesta 1: Diseño Dinámico y Enérgico

**Archivo**: `resources/js/pages/propuesta_1.tsx`
**URL**: `/propuesta-1`

### Características principales:

- **Hero Section con Badge Animado**: Badge que hace "bounce" destacando la clase gratis
- **CTAs Prominentes**: Múltiples llamados a la acción para reservar la clase gratuita
- **Sección Dedicada a Clase Gratis**: Banner completo en gradiente amber/orange explicando la oferta
- **Beneficios con Checkmarks**: Lista clara de beneficios con iconos de check
- **Diseño Moderno**: Uso de gradientes, sombras y efectos hover
- **Tarjetas de Programas Interactivas**: Con estadísticas de estudiantes
- **Footer Oscuro**: Con recordatorio de clase gratis

### Mejor para:
- Atraer atención inmediata
- Audiencia joven y moderna
- Máxima conversión en clase gratis

---

## 📋 Propuesta 2: Enfoque en Proceso y Storytelling

**Archivo**: `resources/js/pages/propuesta_2.tsx`
**URL**: `/propuesta-2`

### Características principales:

- **Top Bar con Promoción**: Barra superior destacando la oferta especial
- **Hero Limpio y Directo**: Mensaje claro con trust indicators
- **Sección "Cómo Funciona"**: 4 pasos visuales del viaje del estudiante
- **Grid de Programas Amplio**: 6 instrumentos con colores distintos
- **Features Section**: 4 valores principales de la academia
- **CTA Central Grande**: Formulario de registro prominente en sección dedicada
- **Info de Contacto al Pie**: Fácil acceso a información

### Mejor para:
- Clientes que necesitan más información antes de decidir
- Explicar el proceso paso a paso
- Generar confianza mediante claridad

---

## 📋 Propuesta 3: Diseño Elegante y Minimalista

**Archivo**: `resources/js/pages/propuesta_3.tsx`
**URL**: `/propuesta-3`

### Características principales:

- **Header Minimalista**: Clean y profesional
- **Hero Elegante**: Tipografía grande, mensaje claro y sutil
- **Badge Elegante de Clase Gratis**: Diseño refinado con borde
- **Grid de Instrumentos Limpio**: Tarjetas con hover effects sutiles
- **Sección de Valores**: 4 compromisos principales
- **CTA Oscuro Elegante**: Sección con fondo oscuro y contenido refinado
- **Formulario Amplio**: Más espacio para completar información
- **Footer Minimal**: Simple y profesional

### Mejor para:
- Audiencia más sofisticada
- Imagen premium y profesional
- Menos es más - enfoque en calidad

---

## 🎨 Paleta de Colores (Consistente en todas)

Todas las propuestas utilizan la misma paleta de colores de la marca:

- **Primario**: Amber (600-800)
- **Secundario**: Orange (500-700)
- **Gradientes**: Amber → Orange
- **Neutros**: Grays (50-900)
- **Fondos**: White, Amber-50, Orange-50

---

## ✅ Elementos Comunes en las Tres

1. **Clase Gratis Destacada**: En todas hay múltiples menciones y CTAs
2. **Sin Compromiso**: Se enfatiza que no hay obligación
3. **Información de Contacto**: Teléfono, email, dirección, horarios
4. **Programas/Instrumentos**: Listado completo de opciones
5. **Testimonios**: Historias de estudiantes satisfechos
6. **Formulario de Contacto**: Para solicitar la clase gratis
7. **Stats**: 500+ estudiantes, 15+ profesores, 10+ años
8. **Responsive**: Todas son mobile-friendly

---

## 🚀 Próximos Pasos

1. **Revisar las tres propuestas** en el navegador
2. **Elegir la que mejor se adapte** a la identidad de la academia
3. **Solicitar ajustes** si es necesario (imágenes reales, textos específicos, etc.)
4. **Implementar funcionalidad** del formulario de contacto
5. **Optimizar para SEO** con meta tags apropiados
6. **Agregar imágenes reales** de la academia y estudiantes

---

## 💡 Recomendaciones

- **Propuesta 1** si buscas máximo impacto y conversión inmediata
- **Propuesta 2** si quieres educar al cliente sobre el proceso
- **Propuesta 3** si buscas una imagen más premium y profesional

Todas son completamente funcionales y listas para recibir tráfico. Solo necesitan:
- Conectar el formulario a un endpoint de Laravel
- Reemplazar las imágenes placeholder con fotos reales
- Ajustar textos específicos (dirección, teléfonos, etc.)

---

## 📝 Notas Técnicas

- Desarrolladas con React 19 + TypeScript
- Usando componentes de Lucide React para iconos
- Totalmente responsive (mobile-first)
- Optimizadas para rendimiento
- Accesibilidad considerada (ARIA labels donde necesario)
- Animaciones sutiles para mejor UX
