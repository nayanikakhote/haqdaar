import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLang } from "@/lib/lang";
import type { Lang } from "@/lib/haqdaar-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HaqDaar — Claim What's Yours" },
      { name: "description", content: "Pick your language and find the welfare benefits you're owed in 2 minutes." },
      { property: "og:title", content: "HaqDaar — Claim What's Yours" },
      { property: "og:description", content: "Welfare benefits navigator for construction workers. Hindi, Marathi, English." },
    ],
  }),
  component: Landing,
});

const OPTIONS: { code: Lang; label: string; sub: string; sample: string }[] = [
  { code: "hi", label: "हिंदी", sub: "Hindi", sample: "आपको मिलने वाले लाभ खोजें" },
  { code: "mr", label: "मराठी", sub: "Marathi", sample: "तुम्हाला मिळणारे लाभ शोधा" },
  { code: "en", label: "English", sub: "English", sample: "Find the benefits you're owed" },
];

function Landing() {
  const { setLang, ui } = useLang();
  const navigate = useNavigate();

  const pick = (code: Lang) => {
    setLang(code);
    navigate({ to: "/intake" });
  };

  return (
    <div className="space-y-8">
      <section className="relative">
        <div className="inline-flex items-center gap-2 border-[3px] border-foreground bg-card px-3 py-1 text-xs font-bold uppercase tracking-widest shadow-brutal-sm">
          <span className="h-2 w-2 bg-accent" /> AI for Social Impact
        </div>
        <h1 className="mt-5 font-display text-4xl font-black leading-[0.95] sm:text-5xl">
          हक़दार
          <span className="block text-2xl font-bold text-muted-foreground sm:text-3xl">
            Claim What's Yours
          </span>
        </h1>
        <p className="mt-4 max-w-md text-base text-foreground">
          For India's 50 million construction workers. No login, no forms — just the welfare benefits you're owed, in your language.
        </p>
      </section>

      <section>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Choose your language · भाषा चुनें · भाषा निवडा
        </p>
        <div className="grid gap-3">
          {OPTIONS.map((o) => (
            <button
              key={o.code}
              onClick={() => pick(o.code)}
              className="brutal-card group flex items-center justify-between gap-4 p-5 text-left transition-transform hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0"
            >
              <div>
                <div className="font-display text-2xl font-extrabold">{o.label}</div>
                <div className="mt-1 text-sm text-muted-foreground">{o.sample}</div>
              </div>
              <div className="grid h-12 w-12 place-items-center border-[3px] border-foreground bg-primary text-lg font-black shadow-brutal-sm group-hover:bg-accent group-hover:text-accent-foreground">
                →
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="brutal-card-sm bg-muted p-4 text-xs text-muted-foreground">
        {ui("disclaimer")}
      </section>
    </div>
  );
}
