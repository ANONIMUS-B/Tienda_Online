<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" translate="no" @class(['dark' => ($appearance ?? 'system') == 'dark', 'notranslate'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="google" content="notranslate">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: #ffffff;
                color-scheme: light;
            }

            html.dark {
                background-color: #ffffff;
                color-scheme: light;
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/images/brand/jbtechline-logo.png" type="image/png">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <link rel="apple-touch-icon" href="/images/brand/jbtechline-logo.png">

        @fonts

        {{-- SEO Meta Tags --}}
        <meta name="title" content="JBTECHLINE | Tienda Online de Software, Antivirus y Soporte Tecnológico">
        <meta name="description" content="JBTECHLINE: Tu aliado tecnológico en Perú. Venta de software original, licencias antivirus NOD32 con garantía, equipos de cómputo, componentes y soporte técnico especializado.">
        <meta name="keywords" content="JBTECHLINE, software original, antivirus NOD32, soporte tecnico Peru, licencias de software, venta de computadoras, tecnologia Peru">
        <meta name="author" content="JBTECHLINE">
        <meta name="robots" content="index, follow">
        <link rel="canonical" href="{{ url()->current() }}">

        {{-- Open Graph / Facebook / WhatsApp --}}
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:title" content="JBTECHLINE | Tienda Online de Software, Antivirus y Soporte Tecnológico">
        <meta property="og:description" content="JBTECHLINE: Tu aliado tecnológico en Perú. Venta de software original, antivirus NOD32 con garantía, equipos y soporte técnico especializado.">
        <meta property="og:image" content="{{ asset('images/brand/jbtechline-logo.png') }}">
        <meta property="og:site_name" content="JBTECHLINE">
        <meta property="og:locale" content="es_PE">

        {{-- Twitter --}}
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="{{ url()->current() }}">
        <meta name="twitter:title" content="JBTECHLINE | Tu Aliado Tecnológico">
        <meta name="twitter:description" content="Software original, antivirus NOD32 con garantía, componentes y soporte técnico especializado en Perú.">
        <meta name="twitter:image" content="{{ asset('images/brand/jbtechline-logo.png') }}">

        {{-- Structured Data JSON-LD --}}
        <script type="application/ld+json">
        {!! json_encode([
            '@context' => 'https://schema.org',
            '@type' => 'Store',
            'name' => 'JBTECHLINE',
            'image' => asset('images/brand/jbtechline-logo.png'),
            'url' => url('/'),
            'telephone' => '+51921820612',
            'priceRange' => 'S/.',
            'description' => 'Tienda online de software original, licencias antivirus NOD32, componentes y soporte técnico especializado en Perú.',
            'address' => [
                '@type' => 'PostalAddress',
                'addressCountry' => 'PE',
            ],
        ], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) !!}
        </script>
        <script type="application/ld+json">
        {!! json_encode([
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            'name' => 'JBTECHLINE',
            'url' => url('/'),
            'potentialAction' => [
                '@type' => 'SearchAction',
                'target' => url('/buscar') . '?q={search_term_string}',
                'query-input' => 'required name=search_term_string',
            ],
        ], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) !!}
        </script>

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'JBTECHLINE') }} | Tienda Online de Software, Antivirus y Soporte Tecnológico</title>
        </x-inertia::head>
    </head>
    <body class="notranslate font-sans antialiased" translate="no">
        <x-inertia::app />
    </body>
</html>
