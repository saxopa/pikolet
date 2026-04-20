import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* SEO & partage */}
        <meta name="description" content="La communauté des éleveurs de pikolèt & lorti en Guyane. Partagez vos chants, suivez vos oiseaux, rejoignez les compétitions." />
        <meta property="og:title" content="Pikolèt — Communauté éleveurs Guyane" />
        <meta property="og:description" content="Partagez vos chants, suivez vos oiseaux, rejoignez les compétitions de pikolèt & lorti." />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="fr_FR" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Pikolèt" />
        <meta name="twitter:description" content="La communauté des éleveurs de pikolèt & lorti en Guyane." />

        {/* PWA iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Pikolèt" />
        <link rel="apple-touch-icon" href="/pikolet/assets/images/icon.png" />

        {/* Theme */}
        <meta name="theme-color" content="#B85C38" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap"
          rel="stylesheet"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const globalStyles = `
body {
  background-color: #FAF6F0;
  font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
}
.font-display, [class*="font-display"] {
  font-family: 'Lora', Georgia, serif;
}
@media (prefers-color-scheme: dark) {
  body { background-color: #1C1209; }
}`;
