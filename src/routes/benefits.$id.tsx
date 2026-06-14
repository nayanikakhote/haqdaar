import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/lang";
import { loadProfile, isProfileComplete } from "@/lib/profile";
import { getStateData, matchBenefits } from "@/lib/rulesEngine.js";
import type { Benefit, Profile } from "@/lib/haqdaar-types";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/benefits/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Benefit · HaqDaar` },
      { name: "description", content: `How to claim benefit ${params.id} — documents, steps, where to apply.` },
    ],
  }),
  component: BenefitDetail,
  notFoundComponent: () => (
    <div className="brutal-card p-6 text-center">
      <h2 className="font-display text-xl font-extrabold">Benefit not found</h2>
      <Link to="/benefits" className="mt-3 inline-block underline">← back to your benefits</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="brutal-card p-6 text-center">
      <h2 className="font-display text-xl font-extrabold">Something went wrong</h2>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function BenefitDetail() {
  const { id } = Route.useParams();
  const { ui, t } = useLang();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [benefit, setBenefit] = useState<Benefit | null>(null);
  const [missing, setMissing] = useState(false);
  const [steps, setSteps] = useState<string[] | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const p = loadProfile();
    if (!isProfileComplete(p)) { navigate({ to: "/intake" }); return; }
    setProfile(p);

    const data = getStateData(p.state);
    const b = data?.benefits.find((x) => x.id === id);
    if (!b) { setMissing(true); return; }
    setBenefit(b);

    try {
      const raw = localStorage.getItem("haqdaar:docs:" + id);
      if (raw) setChecked(JSON.parse(raw));
    } catch {}
  }, [id, navigate]);

  useEffect(() => {
    if (!benefit) return;
    setSteps(Array.isArray(benefit.howToClaim) && benefit.howToClaim.length > 0 ? benefit.howToClaim : []);
  }, [benefit]);

  useEffect(() => {
    if (!benefit) return;
    try { localStorage.setItem("haqdaar:docs:" + benefit.id, JSON.stringify(checked)); } catch {}
  }, [checked, benefit]);

  if (missing) {
    return (
      <div className="brutal-card p-6 text-center">
        <h2 className="font-display text-xl font-extrabold">Benefit not found</h2>
        <Link to="/benefits" className="mt-3 inline-block underline">← back to your benefits</Link>
      </div>
    );
  }
  if (!benefit || !profile) return null;

  const result = matchBenefits(profile);
  const isLocked = result.afterRegistration.some((b) => b.id === benefit.id);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${t(benefit.name)} — ${t(benefit.amount.display)}\n${shareUrl}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="space-y-6">
      <Link to="/benefits" className="text-xs font-bold uppercase tracking-widest underline">
        ← {ui("yourBenefits")}
      </Link>

      <header className="brutal-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {benefit.category}
            </div>
            <h1 className="mt-1 font-display text-2xl font-black leading-tight sm:text-3xl">
              {t(benefit.name)}
            </h1>
          </div>
          {isLocked && (
            <div className="shrink-0 border-[3px] border-foreground bg-warning px-2 py-1 text-xs font-bold uppercase shadow-brutal-sm">
              🔒 {ui("registerFirst")}
            </div>
          )}
        </div>
        <div className="mt-4 inline-block border-[3px] border-foreground bg-primary px-3 py-2 font-display text-2xl font-black tabular-nums shadow-brutal-sm">
          {t(benefit.amount.display)}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-foreground">{t(benefit.description)}</p>
      </header>

      <section className="brutal-card p-5">
        <h2 className="font-display text-lg font-extrabold">{ui("documentsNeeded")}</h2>
        <ul className="mt-3 space-y-2">
          {benefit.documents.map((d) => {
            const on = !!checked[d];
            return (
              <li key={d}>
                <label className="flex cursor-pointer items-start gap-3">
                  <span
                    className={
                      "mt-0.5 grid h-6 w-6 shrink-0 place-items-center border-[3px] border-foreground text-xs font-black transition-colors " +
                      (on ? "bg-success text-success-foreground" : "bg-card")
                    }
                  >
                    {on ? "✓" : ""}
                  </span>
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={(e) => setChecked((c) => ({ ...c, [d]: e.target.checked }))}
                    className="sr-only"
                  />
                  <span className={"text-sm " + (on ? "line-through text-muted-foreground" : "")}>{d}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="brutal-card p-5">
        <h2 className="font-display text-lg font-extrabold">{ui("howToClaim")}</h2>
        <ol className="mt-3 space-y-3">
          {steps === null
            ? [1, 2, 3].map((i) => (
                <li key={i} className="h-12 border-[3px] border-foreground bg-muted/60 animate-pulse" />
              ))
            : steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center border-[3px] border-foreground bg-primary font-display text-sm font-black shadow-brutal-sm">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-sm leading-relaxed">{s}</p>
                </li>
              ))}
        </ol>
        {benefit.officeLink && (
          <a href={benefit.officeLink} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block">
            <Button variant="brutal">{ui("claimNow")} ↗</Button>
          </a>
        )}
      </section>

      <div className="no-print flex flex-wrap gap-3">
        {benefit.officeLink && (
          <a href={benefit.officeLink} target="_blank" rel="noopener noreferrer">
            <Button variant="brutal">{ui("whereToApply")} ↗</Button>
          </a>
        )}
        <a href={whatsapp} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary">{ui("shareWhatsapp")}</Button>
        </a>
        <Button variant="outline" onClick={() => window.print()}>{ui("saveChecklist")}</Button>
      </div>

      <p className="brutal-card-sm bg-muted p-3 text-xs text-muted-foreground">
        {ui("disclaimer")}
      </p>
    </div>
  );
}
