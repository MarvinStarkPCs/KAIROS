@if (config('seo.google_verification'))
        <meta name="google-site-verification" content="{{ config('seo.google_verification') }}">
@endif
@if (! empty($seo))
        <meta name="description" content="{{ $seo['description'] }}">
        <meta name="robots" content="index, follow">
        <link rel="canonical" href="{{ $seo['canonical'] }}">

        <meta property="og:type" content="website">
        <meta property="og:site_name" content="{{ config('seo.site_name') }}">
        <meta property="og:locale" content="{{ config('seo.locale') }}">
        <meta property="og:url" content="{{ $seo['canonical'] }}">
        <meta property="og:title" content="{{ $seo['title'] }}">
        <meta property="og:description" content="{{ $seo['description'] }}">
        <meta property="og:image" content="{{ $seo['image'] }}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="{{ config('seo.site_name') }}">

        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $seo['title'] }}">
        <meta name="twitter:description" content="{{ $seo['description'] }}">
        <meta name="twitter:image" content="{{ $seo['image'] }}">

        @if (config('seo.analytics_id'))
            <script async src="https://www.googletagmanager.com/gtag/js?id={{ config('seo.analytics_id') }}"></script>
            <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', @json(config('seo.analytics_id')));
            </script>
        @endif

        @if (! empty($seo['jsonld']))
            {{-- Se arma con json_encode: escrita a mano en Blade, la clave de contexto con arroba se toma como directiva. --}}
            <script type="application/ld+json">{!! json_encode($seo['jsonld'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) !!}</script>
        @endif
@else
        <meta name="robots" content="noindex, nofollow">
@endif
