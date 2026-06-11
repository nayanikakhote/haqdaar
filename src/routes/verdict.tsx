import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/lib/lang";
import { loadProfile, isProfileComplete } from "@/lib/profile";
import { matchBenefits } from "@/lib/rulesEngine.js";
import type { MatchResult, Profile } from "@/lib/haqdaar-types";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/verdict")({
  head: () => ({
    meta: [
      { title: "Your Verdict · HaqDaar" },
      { name: "description", content: "See whether you qualify and what to do next." },
    ],
  }),
  component: VerdictPage,
});

const STATUS_STYLES: Record<string, { bg: string; label: string; key: string }> = {
  registered:     { bg: "bg-success text-success-foreground", label: "✓", key: "verdict_registered" },
  eligible:       { bg: "bg-success text-success-foreground", label: "✓", key: "verdict_can_register" },
  not_yet:        { bg: "bg-warning text-warning-foreground", label: "!", key: "verdict_needs_days" },
  not_eligible:   { bg: "bg-destructive text-destructive-foreground", label: "×", key: "verdict_age" },
  error:          { bg: "bg-destructive text-destructive-foreground", label: "×", key: "verdict_age" },
};

function VerdictPage() {
  const { ui, t } = useLang();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);

  useEffect(() => {
    const p = loadProfile();
    if (!isProfileComplete(p)) {
      navigate({ to: "/intake" });
      return;
    }
    setProfile(p);
    setResult(matchBenefits(p));
  }, [navigate]);

  const verdictStyle = useMemo(() => {
    if (!result) return STATUS_STYLES.eligible;
    return STATUS_STYLES[result.verdict.status] || STATUS_STYLES.eligible;
  }, [result]);

  if (!profile || !result) return null;

  const { verdict, registrationStep, eligibleNow, afterRegistration } = result;
  const totalBenefits = eligibleNow.length + afterRegistration.length;

  return (
    <div className="space-y-6">
      <div className={"brutal-card overflow-hidden p-0"}>
        <div className={"flex items-center gap-4 px-5 py-5 " + verdictStyle.bg}>
          <div className="grid h-14 w-14 shrink-0 place-items-center border-[3px] border-foreground bg-card text-3xl font-black text-foreground">
            {verdictStyle.label}
          </div>
          <div className="font-display text-xl font-extrabold leading-tight sm:text-2xl">
            {ui(verdictStyle.key)}
          </div>
        </div>
        <div className="border-t-[3px] border-foreground bg-card p-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="Age" value={String(profile.age)} />
            <Stat label="Days" value={String(profile.daysWorked)} />
            <Stat label="State" value={profile.state === "maharashtra" ? "MH" : "DL"} />
          </div>
          {verdict.status === "not_yet" && typeof verdict.gap === "number" && (
            <p className="mt-4 text-sm text-muted-foreground">
              Keep working — you need <span className="font-bold text-foreground">{verdict.gap} more days</span> to register.
            </p>
          )}
        </div>
      </div>

      {registrationStep && (
        <div className="brutal-card border-l-[10px] p-5">
          <div className="text-xs font-bold uppercase tracking-widest text-accent">Step 1</div>
          <h3 className="mt-1 font-display text-xl font-extrabold">{t(registrationStep.name)}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t(registrationStep.description)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={registrationStep.officeLink} target="_blank" rel="noopener noreferrer">
              <Button variant="brutal">{ui("registerFirst")} →</Button>
            </a>
            <Link to="/benefits/$id" params={{ id: registrationStep.id }}>
              <Button variant="outline">How to register</Button>
            </Link>
          </div>
        </div>
      )}

      <div className="brutal-card-sm bg-card p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your matches</div>
        <div className="mt-1 font-display text-4xl font-black tabular-nums">{totalBenefits}</div>
        <p className="mt-1 text-sm text-muted-foreground">
          benefits matched to your profile.
        </p>
        <Link to="/benefits" className="mt-4 inline-block">
          <Button variant="brutal" size="lg">{ui("seeBenefits")} →</Button>
        </Link>
      </div>

      <Link to="/intake" className="block text-center text-xs font-bold uppercase tracking-widest text-muted-foreground underline">
        {ui("startOver")}
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-[3px] border-foreground bg-muted p-3">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl font-black tabular-nums">{value}</div>
    </div>
  );
}
