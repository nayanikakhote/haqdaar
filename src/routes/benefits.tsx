import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/lang";
import { loadProfile, isProfileComplete } from "@/lib/profile";
import { matchBenefits } from "@/lib/rulesEngine.js";
import type { Benefit, MatchResult } from "@/lib/haqdaar-types";

export const Route = createFileRoute("/benefits")({
  head: () => ({
    meta: [
      { title: "Your Benefits · HaqDaar" },
      { name: "description", content: "All welfare benefits you qualify for, with amounts and how to claim them." },
    ],
  }),
  component: BenefitsList,
});

function BenefitsList() {
  const { ui, t } = useLang();
  const navigate = useNavigate();
  const [result, setResult] = useState<MatchResult | null>(null);

  useEffect(() => {
    const p = loadProfile();
    if (!isProfileComplete(p)) { navigate({ to: "/intake" }); return; }
    setResult(matchBenefits(p));
  }, [navigate]);

  if (!result) return null;

  const { eligibleNow, afterRegistration } = result;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-black">{ui("yourBenefits")}</h1>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 bg-success" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {ui("eligibleNow")} · {eligibleNow.length}
          </h2>
        </div>
        {eligibleNow.length === 0 ? (
          <p className="brutal-card-sm bg-muted p-4 text-sm text-muted-foreground">
            No directly-claimable benefits yet — register first to unlock the list below.
          </p>
        ) : (
          <div className="grid gap-3">
            {eligibleNow.map((b) => <BenefitCard key={b.id} b={b} locked={false} />)}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 bg-warning" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {ui("afterRegistration")} · {afterRegistration.length}
          </h2>
        </div>
        <div className="grid gap-3">
          {afterRegistration.map((b) => <BenefitCard key={b.id} b={b} locked />)}
        </div>
      </section>

      <div className="flex flex-wrap gap-3 pt-4">
        <Link to="/verdict" className="text-xs font-bold uppercase tracking-widest underline">← Verdict</Link>
        <Link to="/intake" className="text-xs font-bold uppercase tracking-widest underline text-muted-foreground">{ui("startOver")}</Link>
      </div>
    </div>
  );

  function BenefitCard({ b, locked }: { b: Benefit; locked: boolean }) {
    return (
      <Link
        to="/benefits/$id"
        params={{ id: b.id }}
        className={
          "brutal-card group block p-5 transition-transform hover:-translate-x-1 hover:-translate-y-1 " +
          (locked ? "opacity-90" : "")
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {b.category}
            </div>
            <h3 className="mt-1 font-display text-lg font-extrabold leading-tight">{t(b.name)}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{t(b.description)}</p>
          </div>
          <div className="shrink-0 text-right">
            {locked && (
              <div className="mb-1 inline-block border-[2px] border-foreground bg-warning px-1.5 py-0.5 text-[10px] font-bold uppercase">
                🔒
              </div>
            )}
            <div className="border-[3px] border-foreground bg-primary px-2 py-1 text-sm font-black tabular-nums shadow-brutal-sm">
              {t(b.amount.display)}
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs font-bold uppercase tracking-widest text-foreground">
          {ui("howToClaim")} →
        </div>
      </Link>
    );
  }
}
