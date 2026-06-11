import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/lang";
import { loadProfile, saveProfile, isProfileComplete } from "@/lib/profile";
import { parseWorkerInput } from "@/lib/claudeClient.js";
import type { Profile } from "@/lib/haqdaar-types";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/intake")({
  head: () => ({
    meta: [
      { title: "Intake · HaqDaar" },
      { name: "description", content: "Answer 8 quick questions to find the benefits you qualify for." },
    ],
  }),
  component: Intake,
});

type StepKey =
  | "state" | "age" | "work" | "days"
  | "registered" | "gender" | "married" | "kids";

const STEPS: StepKey[] = ["state", "age", "work", "days", "registered", "gender", "married", "kids"];

const WORK_TYPES = [
  "mason", "tiling", "painting", "carpentry",
  "helper", "electrician", "plumbing", "other",
] as const;

function Intake() {
  const { ui } = useLang();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveProfile(profile);
  }, [profile, ready]);

  const update = (patch: Partial<Profile>) => setProfile((p) => ({ ...p, ...patch }));

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const merged = { ...loadProfile(), ...profile };
      saveProfile(merged);
      if (isProfileComplete(merged)) navigate({ to: "/verdict" });
    }
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const current = STEPS[step];
  const canAdvance = isStepAnswered(current, profile);

  if (!ready) return null;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <span>{ui("progress")} {step + 1} / {STEPS.length}</span>
          <span>{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
        </div>
        <div className="mt-2 h-3 border-[3px] border-foreground bg-card">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="brutal-card p-5 sm:p-6">
        <StepView stepKey={current} profile={profile} update={update} onAutoAdvance={next} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={back} disabled={step === 0}>
          ← {ui("back")}
        </Button>
        <Button variant="brutal" onClick={next} disabled={!canAdvance}>
          {step === STEPS.length - 1 ? ui("seeBenefits") : ui("next") + " →"}
        </Button>
      </div>
    </div>
  );
}

function isStepAnswered(key: StepKey, p: Partial<Profile>): boolean {
  switch (key) {
    case "state": return !!p.state;
    case "age": return typeof p.age === "number" && p.age > 0;
    case "work": return !!p.workType;
    case "days": return typeof p.daysWorked === "number";
    case "registered": return !!p.registered;
    case "gender": return !!p.gender;
    case "married": return typeof p.married === "boolean";
    case "kids": return typeof p.kidsInSchool === "boolean";
  }
}

function QHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">{children}</h2>;
}

function StepView({
  stepKey, profile, update, onAutoAdvance,
}: {
  stepKey: StepKey;
  profile: Partial<Profile>;
  update: (p: Partial<Profile>) => void;
  onAutoAdvance: () => void;
}) {
  const { ui } = useLang();

  if (stepKey === "state") {
    return (
      <div className="space-y-4">
        <QHeading>{ui("q_state")}</QHeading>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(["maharashtra", "delhi"] as const).map((s) => (
            <ChoiceCard
              key={s}
              selected={profile.state === s}
              onClick={() => { update({ state: s }); }}
            >
              <div className="text-xl font-extrabold capitalize">{s}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {s === "maharashtra" ? "MahaBOCW" : "DBOCWWB"}
              </div>
            </ChoiceCard>
          ))}
        </div>
      </div>
    );
  }

  if (stepKey === "age") {
    const age = profile.age ?? 0;
    return (
      <div className="space-y-4">
        <QHeading>{ui("q_age")}</QHeading>
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="lg" onClick={() => update({ age: Math.max(0, age - 1) })}>−</Button>
          <input
            type="number"
            inputMode="numeric"
            value={age || ""}
            onChange={(e) => update({ age: parseInt(e.target.value || "0", 10) || 0 })}
            className="h-20 w-32 border-[3px] border-foreground bg-card text-center font-display text-5xl font-black tabular-nums shadow-brutal-sm focus:outline-none"
            placeholder="—"
          />
          <Button variant="outline" size="lg" onClick={() => update({ age: age + 1 })}>+</Button>
        </div>
        <p className="text-center text-xs text-muted-foreground">18 – 60</p>
      </div>
    );
  }

  if (stepKey === "work") {
    return <WorkStep profile={profile} update={update} />;
  }

  if (stepKey === "days") {
    return (
      <div className="space-y-4">
        <QHeading>{ui("q_days")}</QHeading>
        <div className="grid gap-3">
          <ChoiceCard selected={profile.daysWorked === 120} onClick={() => { update({ daysWorked: 120 }); onAutoAdvance(); }}>
            <div className="text-lg font-extrabold">{ui("opt_over90")}</div>
            <div className="text-xs text-muted-foreground">≈ 120+ days</div>
          </ChoiceCard>
          <ChoiceCard selected={profile.daysWorked === 45} onClick={() => { update({ daysWorked: 45 }); onAutoAdvance(); }}>
            <div className="text-lg font-extrabold">{ui("opt_under90")}</div>
            <div className="text-xs text-muted-foreground">≈ 45 days</div>
          </ChoiceCard>
        </div>
      </div>
    );
  }

  if (stepKey === "registered") {
    return (
      <div className="space-y-4">
        <QHeading>{ui("q_registered")}</QHeading>
        <div className="grid gap-3">
          {(["yes", "no", "dontknow"] as const).map((v) => (
            <ChoiceCard key={v} selected={profile.registered === v} onClick={() => { update({ registered: v }); onAutoAdvance(); }}>
              <div className="text-lg font-extrabold">{ui("opt_" + v)}</div>
            </ChoiceCard>
          ))}
        </div>
      </div>
    );
  }

  if (stepKey === "gender") {
    return (
      <div className="space-y-4">
        <QHeading>{ui("q_gender")}</QHeading>
        <div className="grid grid-cols-2 gap-3">
          {(["male", "female"] as const).map((v) => (
            <ChoiceCard key={v} selected={profile.gender === v} onClick={() => { update({ gender: v }); onAutoAdvance(); }}>
              <div className="text-lg font-extrabold">{ui("opt_" + v)}</div>
            </ChoiceCard>
          ))}
        </div>
      </div>
    );
  }

  if (stepKey === "married") {
    return (
      <div className="space-y-4">
        <QHeading>{ui("q_married")}</QHeading>
        <div className="grid grid-cols-2 gap-3">
          <ChoiceCard selected={profile.married === true} onClick={() => { update({ married: true }); onAutoAdvance(); }}>
            <div className="text-lg font-extrabold">{ui("opt_yes")}</div>
          </ChoiceCard>
          <ChoiceCard selected={profile.married === false} onClick={() => { update({ married: false }); onAutoAdvance(); }}>
            <div className="text-lg font-extrabold">{ui("opt_no")}</div>
          </ChoiceCard>
        </div>
      </div>
    );
  }

  // kids
  return (
    <div className="space-y-4">
      <QHeading>{ui("q_kids")}</QHeading>
      <div className="grid grid-cols-2 gap-3">
        <ChoiceCard selected={profile.kidsInSchool === true} onClick={() => update({ kidsInSchool: true })}>
          <div className="text-lg font-extrabold">{ui("opt_yes")}</div>
        </ChoiceCard>
        <ChoiceCard selected={profile.kidsInSchool === false} onClick={() => update({ kidsInSchool: false })}>
          <div className="text-lg font-extrabold">{ui("opt_no")}</div>
        </ChoiceCard>
      </div>
    </div>
  );
}

function WorkStep({ profile, update }: { profile: Partial<Profile>; update: (p: Partial<Profile>) => void }) {
  const { ui } = useLang();
  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);

  const onParse = async () => {
    if (!text.trim()) return;
    setParsing(true);
    try {
      const parsed = await parseWorkerInput(text, "work");
      const patch: Partial<Profile> = {};
      if (parsed.workType) patch.workType = parsed.workType;
      if (typeof parsed.age === "number") patch.age = parsed.age;
      if (typeof parsed.daysWorked === "number") patch.daysWorked = parsed.daysWorked;
      if (typeof parsed.kidsInSchool === "boolean") patch.kidsInSchool = parsed.kidsInSchool;
      if (typeof parsed.married === "boolean") patch.married = parsed.married;
      if (parsed.registered) patch.registered = parsed.registered;
      update(patch);
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="space-y-5">
      <QHeading>{ui("q_work")}</QHeading>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {WORK_TYPES.map((w) => (
          <button
            key={w}
            onClick={() => update({ workType: w })}
            className={
              "border-[3px] border-foreground p-3 text-sm font-bold transition-transform shadow-brutal-sm hover:-translate-y-0.5 " +
              (profile.workType === w ? "bg-primary" : "bg-card hover:bg-muted")
            }
          >
            {ui("work_" + w)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          या अपने शब्दों में बताएं · or tell us in your words
        </div>
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={ui("typeHere")}
            className="h-12 flex-1 border-[3px] border-foreground bg-card px-3 text-sm shadow-brutal-sm focus:outline-none"
          />
          <Button variant="brutal" onClick={onParse} disabled={!text.trim() || parsing}>
            {parsing ? "…" : "↵"}
          </Button>
        </div>
        {profile.workType && (
          <div className="text-xs text-muted-foreground">
            Detected: <span className="font-bold text-foreground">{ui("work_" + profile.workType)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ChoiceCard({
  selected, onClick, children,
}: { selected?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        "border-[3px] border-foreground p-4 text-left shadow-brutal-sm transition-transform hover:-translate-y-0.5 active:translate-y-0 " +
        (selected ? "bg-primary" : "bg-card hover:bg-muted")
      }
    >
      {children}
    </button>
  );
}
