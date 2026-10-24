<!DOCTYPE html>
<html lang="es" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Google Tag Manager: solo en las páginas públicas (las que traen $seo) --}}
        @if (! empty($seo) && config('seo.tag_manager_id'))
            <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','{{ config('seo.tag_manager_id') }}');</script>
        @endif

        {{-- Detecta modo oscuro --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';
                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDark) document.documentElement.classList.add('dark');
                }
            })();
        </script>

        <style>
            html { background-color: oklch(1 0 0); }
            html.dark { background-color: oklch(0.145 0 0); }
        </style>

        <title inertia>{{ $seo['title'] ?? 'Academia Linaje' }}</title>
        @include('partials.seo')

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        {{-- ⚡️ ESTA LÍNEA ES CLAVE PARA QUE FUNCIONE route() --}}
        @routes
    
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @if (! empty($seo) && config('seo.tag_manager_id'))
            <noscript><iframe src="https://www.googletagmanager.com/ns.html?id={{ config('seo.tag_manager_id') }}"
            height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
        @endif
        @if (! empty($seo))
            <noscript>
                <h1>{{ $seo['title'] }}</h1>
                <p>{{ $seo['description'] }}</p>
                <p>WhatsApp: {{ config('seo.business.telephone') }} · {{ config('seo.business.street') }}, {{ config('seo.business.locality') }}</p>
            </noscript>
        @endif
        @inertia
    </body>
</html>
