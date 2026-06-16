import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";

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
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0A0A0F" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "HCB" },
      { name: "mobile-web-app-capable", content: "yes" },
      { title: "HCB Ar Condicionado Automotivo em Castanhal | Peças e Serviços" },
      {
        name: "description",
        content:
          "Especialistas em ar condicionado automotivo em Castanhal. Peças para linha leve e pesada, compressores e manutenção de refrigeração veicular.",
      },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "HCB Ar Condicionado Automotivo em Castanhal" },
      {
        property: "og:description",
        content:
          "Peças de ar-condicionado automotivo linha leve e pesada em Castanhal. Qualidade e agilidade para oficinas e varejo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "HCB Ar Condicionado Automotivo" },
      {
        name: "twitter:description",
        content:
          "Peças de ar-condicionado automotivo linha leve, pesada e fora de estrada. Atendemos varejo e oficinas com agilidade e qualidade.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4df77a49-caff-494f-93e6-2863a6b91fa1/id-preview-08923826--1437f3b0-fe7f-4f6b-8c41-2858d825f265.lovable.app-1778190270102.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4df77a49-caff-494f-93e6-2863a6b91fa1/id-preview-08923826--1437f3b0-fe7f-4f6b-8c41-2858d825f265.lovable.app-1778190270102.png",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap",
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "HCB Ar Condicionado Automotivo",
            image:
              "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4df77a49-caff-494f-93e6-2863a6b91fa1/id-preview-08923826--1437f3b0-fe7f-4f6b-8c41-2858d825f265.lovable.app-1778190270102.png",
            "@id": "",
            url: "https://hcb.lovable.app",
            telephone: "+55 91 98516-1991",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Centro",
              addressLocality: "Castanhal",
              addressRegion: "PA",
              postalCode: "68740-000",
              addressCountry: "BR",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: -1.2974,
              longitude: -47.9272,
            },
            openingHoursSpecification: {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: "08:00",
              closes: "18:00",
            },
            sameAs: ["https://wa.me/5591985161991"],
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

  // Configure QueryClient defaults for better performance
  queryClient.setDefaultOptions({
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 1,
      refetchOnWindowFocus: false,
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <Outlet />
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
