import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import "../styles.css";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "HCB Ar Condicionado Automotivo | Peças e Serviços em Castanhal - PA" },
      { name: "description", content: "Especialista em ar-condicionado automotivo em Castanhal. Peças Denso original para linha leve, pesada e máquinas. Compressores, condensadores e manutenção rápida." },
      { name: "keywords", content: "ar condicionado automotivo, Castanhal, Pará, peças Denso, compressor ar condicionado, linha pesada, manutenção ar automotivo, HCB Automotivo" },
      { name: "author", content: "HCB Ar Condicionado Automotivo" },
      { property: "og:title", content: "HCB Ar Condicionado Automotivo | Peças e Serviços" },
      { property: "og:description", content: "Especialista em ar-condicionado automotivo em Castanhal. Peças Denso original para linha leve e pesada." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "HCB Ar Condicionado Automotivo" },
      { name: "twitter:description", content: "Especialista em ar-condicionado automotivo em Castanhal. Peças Denso original." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4df77a49-caff-494f-93e6-2863a6b91fa1/id-preview-08923826--1437f3b0-fe7f-4f6b-8c41-2858d825f265.lovable.app-1778190270102.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4df77a49-caff-494f-93e6-2863a6b91fa1/id-preview-08923826--1437f3b0-fe7f-4f6b-8c41-2858d825f265.lovable.app-1778190270102.png" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/hcb-logo.png" },
      { rel: "apple-touch-icon", href: "/hcb-logo.png" },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "HCB Ar Condicionado Automotivo",
            "image": "https://hcbautomotivo.lovable.app/hcb-logo.png",
            "@id": "https://hcbautomotivo.lovable.app",
            "url": "https://hcbautomotivo.lovable.app",
            "telephone": "+5591985161991",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Tv. Primeiro de Maio, 1.719",
              "addressLocality": "Castanhal",
              "addressRegion": "PA",
              "postalCode": "68743-000",
              "addressCountry": "BR"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": -1.297,
              "longitude": -47.927
            },
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "08:00",
                "closes": "18:00"
              },
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": "Saturday",
                "opens": "08:00",
                "closes": "13:00"
              }
            ],
            "sameAs": []
          })}
        </script>
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
