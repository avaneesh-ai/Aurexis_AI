import "./globals.css";
import PWA from "./components/PWA";

export const metadata = {
  title: "Aurexis — your AI workspace",
  description:
    "Aurexis is a friendly AI workspace powered by Ollama: chat, projects and co-work in one beautifully designed place.",
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
  appleWebApp: {
    capable: true,
    title: "Aurexis",
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#05060f" },
    { media: "(prefers-color-scheme: light)", color: "#eef1fb" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Applied before paint so there is no theme flash on load.
const noFlash = `(function(){try{var t=localStorage.getItem('aurexis.theme');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PWA />
        {children}
      </body>
    </html>
  );
}
