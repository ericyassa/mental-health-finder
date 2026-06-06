import { useState, useMemo } from "react";
import { ClipboardCheck, ShieldAlert, Phone, RotateCcw, Copy, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Validated brief screeners — PHQ-9 (depression), GAD-7 (anxiety) + 3 risk questions.
 * Scores are computed client-side and mapped to stepped-care tiers so people can
 * be routed to community / self-help / IAPT / secondary care before crisis point.
 *
 * NB: This is a signposting aid, NOT a clinical diagnosis.
 */

type Option = { label: string; value: number };

const FREQ_OPTIONS: Option[] = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
];

const PHQ9_ITEMS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed — or being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead, or of hurting yourself in some way",
];

const GAD7_ITEMS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen",
];

type Tier = {
  label: string;
  tone: "ok" | "mild" | "moderate" | "severe" | "crisis";
  summary: string;
  routes: string[];
};

function phq9Tier(score: number, q9: number): Tier {
  if (q9 >= 1) {
    return {
      label: "Risk indicator present",
      tone: "crisis",
      summary:
        "Item 9 (thoughts of being better off dead or self-harm) was endorsed. A safety conversation is needed today.",
      routes: [
        "Complete a Safety Plan with the person (use the Safety Plan tab).",
        "If immediate risk: call 999 or go to A&E.",
        "24/7 NHS Mental Health Response Line: 0800 953 1919.",
        "Samaritans 116 123 (free, 24/7). Shout: text SHOUT to 85258.",
      ],
    };
  }
  if (score <= 4) return { label: "Minimal depression (0–4)", tone: "ok", summary: "No active depression indicated.", routes: ["Encourage self-management: sleep, exercise, social contact.", "Signpost to wellbeing apps & community groups."] };
  if (score <= 9) return { label: "Mild depression (5–9)", tone: "mild", summary: "Mild symptoms — community & self-help first.", routes: ["Self-refer to NHS Talking Therapies (Bristol IAPT).", "Guided self-help apps (Silvercloud, Wysa).", "Peer support / community groups (Off The Record, Changes Bristol)."] };
  if (score <= 14) return { label: "Moderate depression (10–14)", tone: "moderate", summary: "Stepped care indicated — talking therapies + GP review.", routes: ["Refer / self-refer to NHS Talking Therapies for CBT.", "GP review — consider medication discussion.", "Social prescribing link worker."] };
  if (score <= 19) return { label: "Moderately severe depression (15–19)", tone: "severe", summary: "GP review needed; consider secondary care.", routes: ["Same-week GP appointment.", "Consider referral to secondary mental health services.", "High-intensity CBT via Talking Therapies."] };
  return { label: "Severe depression (20–27)", tone: "severe", summary: "Urgent GP review and secondary care assessment.", routes: ["Urgent GP review.", "Refer to secondary mental health services.", "Consider crisis support if function severely impaired."] };
}

function gad7Tier(score: number): Tier {
  if (score <= 4) return { label: "Minimal anxiety (0–4)", tone: "ok", summary: "No clinically significant anxiety indicated.", routes: ["Self-management: breathing, exercise, sleep hygiene."] };
  if (score <= 9) return { label: "Mild anxiety (5–9)", tone: "mild", summary: "Mild anxiety — self-help first.", routes: ["Self-help workbooks, mindfulness apps.", "Self-refer to NHS Talking Therapies if persistent."] };
  if (score <= 14) return { label: "Moderate anxiety (10–14)", tone: "moderate", summary: "Talking Therapies recommended.", routes: ["Self-refer to NHS Talking Therapies (CBT).", "GP review for symptom management."] };
  return { label: "Severe anxiety (15–21)", tone: "severe", summary: "GP review and high-intensity therapy.", routes: ["GP review within 1–2 weeks.", "High-intensity CBT.", "Consider secondary care if functional impact severe."] };
}

const toneClasses: Record<Tier["tone"], string> = {
  ok: "border-emerald-300 bg-emerald-50 text-emerald-900",
  mild: "border-sky-300 bg-sky-50 text-sky-900",
  moderate: "border-amber-300 bg-amber-50 text-amber-900",
  severe: "border-orange-400 bg-orange-50 text-orange-900",
  crisis: "border-destructive bg-destructive/10 text-destructive",
};

export function Screeners() {
  const [phq, setPhq] = useState<(number | null)[]>(Array(9).fill(null));
  const [gad, setGad] = useState<(number | null)[]>(Array(7).fill(null));
  const [riskSelfHarm, setRiskSelfHarm] = useState<boolean | null>(null);
  const [riskOthers, setRiskOthers] = useState<boolean | null>(null);
  const [riskSafeguarding, setRiskSafeguarding] = useState<boolean | null>(null);

  const phqScore = useMemo(() => phq.reduce<number>((s, v) => s + (v ?? 0), 0), [phq]);
  const gadScore = useMemo(() => gad.reduce<number>((s, v) => s + (v ?? 0), 0), [gad]);
  const phqComplete = phq.every((v) => v !== null);
  const gadComplete = gad.every((v) => v !== null);

  const phqResult = phqComplete ? phq9Tier(phqScore, phq[8] ?? 0) : null;
  const gadResult = gadComplete ? gad7Tier(gadScore) : null;

  const anyCrisisFlag =
    (phqResult?.tone === "crisis") || riskSelfHarm === true || riskOthers === true || riskSafeguarding === true;

  const reset = () => {
    setPhq(Array(9).fill(null));
    setGad(Array(7).fill(null));
    setRiskSelfHarm(null);
    setRiskOthers(null);
    setRiskSafeguarding(null);
  };

  const copySummary = () => {
    const lines: string[] = [];
    lines.push("Brief Screener Summary");
    lines.push(`Generated: ${new Date().toLocaleString("en-GB")}`);
    lines.push("");
    if (phqResult) {
      lines.push(`PHQ-9 (depression): ${phqScore}/27 — ${phqResult.label}`);
      lines.push(`  → ${phqResult.summary}`);
      phqResult.routes.forEach((r) => lines.push(`  • ${r}`));
      lines.push("");
    }
    if (gadResult) {
      lines.push(`GAD-7 (anxiety): ${gadScore}/21 — ${gadResult.label}`);
      lines.push(`  → ${gadResult.summary}`);
      gadResult.routes.forEach((r) => lines.push(`  • ${r}`));
      lines.push("");
    }
    lines.push("Risk screen:");
    lines.push(`  • Thoughts of self-harm / suicide today: ${riskSelfHarm === null ? "—" : riskSelfHarm ? "YES" : "No"}`);
    lines.push(`  • Thoughts of harming others: ${riskOthers === null ? "—" : riskOthers ? "YES" : "No"}`);
    lines.push(`  • Safeguarding concerns (child / vulnerable adult): ${riskSafeguarding === null ? "—" : riskSafeguarding ? "YES" : "No"}`);
    lines.push("");
    lines.push("Source: Bristol Mental Health Signposting Directory — not a clinical diagnosis.");
    navigator.clipboard.writeText(lines.join("\n"));
  };

  const renderItem = (
    text: string,
    idx: number,
    value: number | null,
    onChange: (v: number) => void,
    namePrefix: string,
  ) => (
    <fieldset key={`${namePrefix}-${idx}`} className="rounded-md border border-border bg-card p-3">
      <legend className="px-1 text-sm font-medium text-foreground">
        {idx + 1}. {text}
      </legend>
      <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {FREQ_OPTIONS.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
              aria-pressed={active}
            >
              <span className="block">{o.label}</span>
              <span className="block text-[10px] opacity-70">({o.value})</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );

  const renderTier = (title: string, score: number, max: number, tier: Tier) => (
    <div className={`rounded-lg border-2 p-4 ${toneClasses[tier.tone]}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-sm font-bold">{title}</h4>
        <span className="text-sm font-semibold">
          Score {score}/{max} — {tier.label}
        </span>
      </div>
      <p className="mt-1 text-sm">{tier.summary}</p>
      <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm">
        {tier.routes.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </div>
  );

  const yesNo = (
    value: boolean | null,
    onChange: (b: boolean) => void,
    name: string,
  ) => (
    <div className="flex gap-2" role="radiogroup" aria-label={name}>
      <Button type="button" size="sm" variant={value === true ? "destructive" : "outline"} onClick={() => onChange(true)}>
        Yes
      </Button>
      <Button type="button" size="sm" variant={value === false ? "default" : "outline"} onClick={() => onChange(false)}>
        No
      </Button>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="rounded-md border-l-4 border-l-primary bg-primary/5 p-3">
        <p className="text-sm text-foreground">
          <strong className="text-primary">Brief Screeners</strong> — PHQ-9 (depression), GAD-7 (anxiety) and a 3-question
          risk screen. Used widely in primary care to triage to the right level of support before crisis. Not a
          diagnostic tool.
        </p>
      </div>

      {anyCrisisFlag && (
        <div className="flex items-start gap-3 rounded-lg border-2 border-destructive bg-destructive/10 p-4 text-destructive">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="space-y-1 text-sm">
            <p className="font-bold">Risk indicator detected — take action now</p>
            <ul className="list-disc pl-5">
              <li>If immediate danger: <strong>call 999</strong> or go to A&E.</li>
              <li className="flex items-center gap-1">
                24/7 NHS Mental Health Response Line: <a className="underline font-semibold" href="tel:08009531919"><Phone className="inline h-3 w-3" /> 0800 953 1919</a>
              </li>
              <li>Samaritans: <a className="underline" href="tel:116123">116 123</a> · Shout: text <strong>SHOUT</strong> to 85258</li>
              <li>Complete a Safety Plan together (Safety Plan tab).</li>
            </ul>
          </div>
        </div>
      )}

      {/* PHQ-9 */}
      <section className="space-y-3">
        <header className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <h3 className="text-base font-bold text-primary">PHQ-9 — Depression</h3>
          <span className="text-xs text-muted-foreground">Over the last 2 weeks, how often have you been bothered by…</span>
        </header>
        <div className="space-y-2">
          {PHQ9_ITEMS.map((t, i) =>
            renderItem(t, i, phq[i], (v) => setPhq((p) => p.map((x, idx) => (idx === i ? v : x))), "phq"),
          )}
        </div>
        {phqResult && renderTier("PHQ-9 result", phqScore, 27, phqResult)}
      </section>

      {/* GAD-7 */}
      <section className="space-y-3">
        <header className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <h3 className="text-base font-bold text-primary">GAD-7 — Anxiety</h3>
          <span className="text-xs text-muted-foreground">Over the last 2 weeks, how often have you been bothered by…</span>
        </header>
        <div className="space-y-2">
          {GAD7_ITEMS.map((t, i) =>
            renderItem(t, i, gad[i], (v) => setGad((p) => p.map((x, idx) => (idx === i ? v : x))), "gad"),
          )}
        </div>
        {gadResult && renderTier("GAD-7 result", gadScore, 21, gadResult)}
      </section>

      {/* Risk screen */}
      <section className="space-y-3 rounded-lg border-2 border-destructive/30 bg-destructive/5 p-4">
        <header className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          <h3 className="text-base font-bold text-destructive">Brief Risk Screen</h3>
        </header>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm">Today, are you having thoughts of harming yourself or that you would be better off dead?</p>
            {yesNo(riskSelfHarm, setRiskSelfHarm, "self-harm risk")}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm">Any thoughts of harming someone else?</p>
            {yesNo(riskOthers, setRiskOthers, "risk to others")}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm">Any safeguarding concerns (a child or vulnerable adult at risk)?</p>
            {yesNo(riskSafeguarding, setRiskSafeguarding, "safeguarding")}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button onClick={copySummary} variant="secondary" size="sm">
          <Copy className="h-4 w-4" /> Copy screener summary
        </Button>
        <Button onClick={reset} variant="outline" size="sm">
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
      </div>
    </div>
  );
}
