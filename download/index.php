<?php
// =====================================================
//  Detecção de dispositivo e redirecionamento de app
// =====================================================

define('URL_APP_STORE',   'https://apps.apple.com/br/app/viajantes-app/id1148316944');
define('URL_GOOGLE_PLAY', 'https://play.google.com/store/apps/details?id=app.nahora');

$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

$isIOS     = (bool) preg_match('/iphone|ipad|ipod/i', $userAgent);
$isAndroid = (bool) preg_match('/android/i', $userAgent);

if ($isIOS) {
    header('Location: ' . URL_APP_STORE, true, 302);
    exit;
}

if ($isAndroid) {
    header('Location: ' . URL_GOOGLE_PLAY, true, 302);
    exit;
}

// Nenhum dispositivo móvel detectado → exibe página com os dois botões
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Viajantes App – Baixe Grátis</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0e4a35;
        }

        .card {
            background: #fff;
            border-radius: 20px;
            padding: 48px 44px;
            text-align: center;
            max-width: 460px;
            width: 90%;
            box-shadow: 0 8px 40px rgba(0,0,0,.25);
        }

        .card img.logo {
            width: 80px;
            margin-bottom: 20px;
        }

        .card h1 {
            font-size: 1.6rem;
            color: #115740;
            margin-bottom: 4px;
            font-weight: 800;
        }

        .card .tagline {
            font-size: 1rem;
            color: #333;
            font-weight: 600;
            margin-bottom: 6px;
        }

        .card .sub {
            font-size: .9rem;
            color: #555;
            line-height: 1.55;
            margin-bottom: 24px;
        }

        .features {
            text-align: left;
            background: #f4faf7;
            border-left: 4px solid #115740;
            border-radius: 8px;
            padding: 16px 18px;
            margin-bottom: 28px;
        }

        .features p {
            font-size: .88rem;
            color: #333;
            font-weight: 600;
            margin-bottom: 10px;
        }

        .features ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .features ul li {
            font-size: .88rem;
            color: #444;
            padding: 4px 0;
            display: flex;
            align-items: flex-start;
            gap: 8px;
            line-height: 1.4;
        }

        .features ul li::before {
            content: '✓';
            color: #115740;
            font-weight: 700;
            flex-shrink: 0;
        }

        .badge-free {
            display: block;
            color: #115740;
            font-size: .85rem;
            font-weight: 700;
            margin-bottom: 20px;
        }

        .btn-store {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            width: 100%;
            padding: 14px 20px;
            border-radius: 12px;
            text-decoration: none;
            font-size: .95rem;
            font-weight: 700;
            transition: opacity .2s, transform .15s;
        }

        .btn-store:hover { opacity: .88; transform: translateY(-1px); }

        .btn-store + .btn-store { margin-top: 12px; }

        .btn-ios {
            background: #000;
            color: #fff;
        }

        .btn-android {
            background: #115740;
            color: #fff;
        }

        .btn-store svg {
            width: 22px;
            height: 22px;
            flex-shrink: 0;
        }
    </style>
</head>
<body>
    <div class="card">

        <!-- <img class="logo" src="/assets/img/logo.png" alt="Logo Viajantes"> -->

        <h1>Viajantes App</h1>
        <p class="tagline">O maior Guia Ecoturístico do Brasil.</p>
        <p class="sub">São mais de 1.500 cachoeiras mapeadas com informações confiáveis.</p>

        <div class="features">
            <p>Você também encontra:</p>
            <ul>
                <li>Reservas diretas em hospedagens selecionadas, ótimos restaurantes, guias e passeios</li>
                <li>Roteiros prontos</li>
                <li>Rede social: comunidade + 800 mil viajantes</li>
            </ul>
        </div>

        <span class="badge-free">Download gratuito</span>

        <a class="btn-store btn-ios" href="<?= htmlspecialchars(URL_APP_STORE) ?>">
            <!-- Ícone Apple -->
            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            App Store (iOS)
        </a>

        <a class="btn-store btn-android" href="<?= htmlspecialchars(URL_GOOGLE_PLAY) ?>">
            <!-- Ícone Google Play -->
            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.18 23.76c.3.17.64.24.99.2l12.87-11.86L13.26 8.3 3.18 23.76zM.43 1.6A1.98 1.98 0 0 0 0 2.8v18.4c0 .42.14.8.43 1.1l.06.06L10.9 12v-.27L.49 1.54.43 1.6zM20.49 10.44l-2.73-1.58-3.5 3.22 3.5 3.22 2.76-1.6c.79-.46.79-1.2-.03-1.66v.4zM4.17.24l12.87 11.86-3.77 3.77L.99.04A1.03 1.03 0 0 1 4.17.24z"/>
            </svg>
            Google Play (Android)
        </a>

    </div>
</body>
</html>
