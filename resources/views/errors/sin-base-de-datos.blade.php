{{-- Se muestra cuando MySQL no responde. No usa la base de datos, sesión ni assets compilados. --}}
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="refresh" content="30">
    <meta name="robots" content="noindex">
    <title>Volvemos en un momento · {{ config('app.name') }}</title>
    <style>
        :root { color-scheme: light dark; --bg: #f7f7f5; --card: #fff; --text: #1d1d1b; --muted: #6b6b66; --line: #e4e4df; }
        @media (prefers-color-scheme: dark) { :root { --bg: #141413; --card: #1d1d1b; --text: #f2f2ee; --muted: #a3a39c; --line: #2f2f2c; } }
        * { box-sizing: border-box; }
        body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 16px; background: var(--bg); color: var(--text); font: 16px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
        main { width: 100%; max-width: 440px; background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 32px 28px; text-align: center; }
        h1 { margin: 0 0 8px; font-size: 1.4rem; }
        p { margin: 0 0 20px; color: var(--muted); }
        button { font: inherit; font-weight: 600; padding: 10px 20px; border-radius: 10px; border: 0; background: var(--text); color: var(--bg); cursor: pointer; }
        small { display: block; margin-top: 16px; color: var(--muted); }
    </style>
</head>
<body>
    <main>
        <h1>Volvemos en un momento</h1>
        <p>{{ config('app.name') }} no puede atenderte en este instante porque el servidor está ocupado. Tus datos están a salvo.</p>
        <button type="button" onclick="location.reload()">Intentar de nuevo</button>
        <small>La página se recarga sola cada 30 segundos.</small>
    </main>
</body>
</html>
