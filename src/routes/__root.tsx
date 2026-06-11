import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { LangProvider, useLang } from "../lib/lang";
import type { Lang } from "../lib/haqdaar-types";

const LANGS: { code: Lang; label: string }[] = [
  { code: "hi", label: "हिं" },
  { code: "mr", label: "मरा" },
  { code: "en", label: "EN" },
];

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="brutal-card max-w-md p-8 text-center">
        <h1 className="text-6xl font-black">404</h1>
        <p className="mt-3 text-sm text-muted-foreground">यह पन्ना नहीं मिला / Page not found</p>
        <Link to="/" className="mt-6 inline-block border-[3px] border-foreground bg-primary px-5 py-2 font-bold uppercase shadow-brutal-sm">
          Home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="brutal-card max-w-md p-8 text-center">
        <h1 className="text-xl font-black uppercase">Something broke</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="border-[3px] border-foreground bg-primary px-4 py-2 font-bold uppercase shadow-brutal-sm"
          >
            Try again
          </button>
          <a href="/" className="border-[3px] border-foreground bg-card px-4 py-2 font-bold uppercase shadow-brutal-sm">
            Home
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
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=5" },
      { name: "theme-color", content: "#ffd400" },
      { title: "HaqDaar — Claim What's Yours" },
      { name: "description", content: "Find the welfare benefits you're owed as a construction worker — free, in 2 minutes. Hindi, Marathi, English." },
      { name: "author", content: "HaqDaar" },
      { property: "og:title", content: "HaqDaar — Claim What's Yours" },
      { property: "og:description", content: "Find the welfare benefits you're owed as a construction worker." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;800&family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function LangSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="no-print flex items-center gap-0 border-[3px] border-foreground bg-card shadow-brutal-sm">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          className={
            "px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors " +
            (lang === l.code ? "bg-foreground text-background" : "hover:bg-muted")
          }
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

function Header() {
  return (
    <header className="no-print sticky top-0 z-40 border-b-[3px] border-foreground bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center border-[3px] border-foreground bg-primary text-base font-black shadow-brutal-sm">
            ह
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">HaqDaar</span>
        </Link>
        <LangSwitcher />
      </div>
    </header>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider>
        <div className="relative z-10 min-h-screen">
          <Header />
          <main className="mx-auto max-w-3xl px-4 py-6 pb-24">
            <Outlet />
          </main>
        </div>
      </LangProvider>
    </QueryClientProvider>
  );
}
