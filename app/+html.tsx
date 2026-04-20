import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/*
          viewport-fit=cover → contenu sous le notch/Dynamic Island
          maximum-scale=1, user-scalable=no → bloque le zoom iOS sur focus input
        */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />

        {/* SEO */}
        <meta name="description" content="La communauté des éleveurs de pikolèt & lorti en Guyane. Partagez vos chants, suivez vos oiseaux, rejoignez les compétitions." />
        <meta property="og:title" content="Pikolèt — Communauté éleveurs Guyane" />
        <meta property="og:description" content="Partagez vos chants, suivez vos oiseaux, rejoignez les compétitions de pikolèt & lorti." />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:image" content="/pikolet/assets/images/icon.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Pikolèt" />
        <meta name="twitter:description" content="La communauté des éleveurs de pikolèt & lorti en Guyane." />
        <meta name="twitter:image" content="/pikolet/assets/images/icon.png" />

        {/* PWA — Android */}
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/pikolet/manifest.json" />

        {/* PWA — iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {/* black-translucent → barre de statut transparente, requiert viewport-fit=cover */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Pikolèt" />

        {/* Icônes Apple touch (toutes tailles couvertes par un même fichier) */}
        <link rel="apple-touch-icon" href="/pikolet/assets/images/icon.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/pikolet/assets/images/icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/pikolet/assets/images/icon.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/pikolet/assets/images/icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/pikolet/assets/images/icon.png" />

        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/pikolet/assets/images/favicon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/pikolet/assets/images/icon.png" />

        {/* Thème */}
        <meta name="theme-color" content="#B85C38" />
        <meta name="msapplication-TileColor" content="#B85C38" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap"
          rel="stylesheet"
        />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
        <script dangerouslySetInnerHTML={{ __html: swScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const globalStyles = `
body {
  background-color: #FAF6F0;
  font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
  /* Bloque le redimensionnement du texte sur rotation iOS */
  -webkit-text-size-adjust: 100%;
  /* Supprime le flash bleu au tap sur iOS/Android */
  -webkit-tap-highlight-color: transparent;
  /* Empêche le pull-to-refresh natif du navigateur */
  overscroll-behavior: none;
}
/* iOS zoom quand font-size < 16px sur un input — fix critique */
input, textarea, select {
  font-size: 16px;
}
.font-display, [class*="font-display"] {
  font-family: 'Lora', Georgia, serif;
}
@media (prefers-color-scheme: dark) {
  body { background-color: #1C1209; }
}
`;

// Enregistrement du service worker — inline pour ne pas dépendre d'un fichier JS externe
const swScript = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('/pikolet/sw.js', { scope: '/pikolet/' })
      .then(function (reg) {
        // Détection d'une mise à jour disponible
        reg.addEventListener('updatefound', function () {
          var nw = reg.installing;
          if (!nw) return;
          nw.addEventListener('statechange', function () {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              // Nouvelle version prête — recharger automatiquement
              window.location.reload();
            }
          });
        });
      })
      .catch(function (err) {
        console.warn('[SW] Echec enregistrement:', err);
      });
  });
}
`;
