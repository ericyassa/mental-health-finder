import { useState, useMemo } from "react";
import { ClipboardList, Printer, Copy, AlertCircle } from "lucide-react";
import { useCategories, useServices, useServiceContacts } from "@/hooks/useDirectoryData";
import type { Category } from "@/hooks/useDirectoryData";

interface CareNeed {
  id: string;
  label: string;
  categoryNames: string[];
}

interface CareNeedGroup {
  label: string;
  needs: CareNeed[];
}

const carePathNeeds: CareNeedGroup[] = [
  {
    label: "Mental Health & Emotional Wellbeing",
    needs: [
      { id: "depression", label: "Depression or persistent low mood", categoryNames: ["Depression & Low Mood"] },
      { id: "postnatal", label: "Postnatal depression or perinatal mental health", categoryNames: ["Postnatal Depression"] },
      { id: "anxiety", label: "Anxiety, panic attacks, or excessive worry", categoryNames: ["Anxiety", "Panic Disorder"] },
      { id: "social_anxiety", label: "Social anxiety or fear of social situations", categoryNames: ["Social Anxiety Disorder"] },
      { id: "sad", label: "Seasonal changes affecting mood (SAD)", categoryNames: ["Seasonal Affective Disorder (SAD)"] },
      { id: "ocd", label: "Obsessive thoughts or compulsive behaviours (OCD)", categoryNames: ["OCD (Obsessive-Compulsive Disorder)"] },
      { id: "selfharm", label: "Self-harm or thoughts of self-harm", categoryNames: ["Self-Harm", "Emotional Dysregulation & Self-Harm"] },
      { id: "crisis", label: "Mental health crisis or urgent support needed", categoryNames: ["Crisis Support (Urgent)", "Suicide Prevention"] },
      { id: "trauma", label: "Trauma, PTSD, or past abuse", categoryNames: ["PTSD (Post-Traumatic Stress Disorder)", "Trauma & PTSD"] },
      { id: "bipolar", label: "Bipolar disorder or mood swings", categoryNames: ["Bipolar Disorder"] },
      { id: "psychosis", label: "Psychosis or schizophrenia", categoryNames: ["Psychosis", "Schizophrenia"] },
      { id: "bpd", label: "Borderline personality disorder (BPD/EUPD)", categoryNames: ["Borderline Personality Disorder (BPD)"] },
      { id: "eating", label: "Eating disorder or disordered eating", categoryNames: ["Eating Disorders"] },
      { id: "emotional", label: "Emotional dysregulation or intense emotions", categoryNames: ["Emotional Dysregulation & Self-Harm"] },
    ],
  },
  {
    label: "Neurodevelopmental & Learning",
    needs: [
      { id: "autism", label: "Autism (ASD) – diagnosis or support", categoryNames: ["Autism Spectrum Disorder (ASD)"] },
      { id: "adhd", label: "ADHD – diagnosis or support", categoryNames: ["ADHD"] },
      { id: "learning", label: "Learning disability support", categoryNames: ["Learning Disabilities"] },
    ],
  },
  {
    label: "Substance Use & Addiction",
    needs: [
      { id: "addiction", label: "Drug or alcohol misuse", categoryNames: ["Addiction - Drugs & Alcohol"] },
    ],
  },
  {
    label: "Safety & Violence",
    needs: [
      { id: "dv_victim", label: "Experiencing domestic abuse", categoryNames: ["Domestic Abuse - Victims"] },
      { id: "dv_perp", label: "Concerned about own abusive behaviour", categoryNames: ["Domestic Abuse - Perpetrators"] },
      { id: "sexual_violence", label: "Sexual violence or abuse (past or recent)", categoryNames: ["Sexual Violence & Abuse Support", "Sexual Violence Support"] },
    ],
  },
  {
    label: "Identity & Discrimination",
    needs: [
      { id: "lgbt", label: "LGBTQ+ specific mental health support", categoryNames: ["LGBT+ Mental Health Support"] },
      { id: "racism", label: "Racism or discrimination affecting wellbeing", categoryNames: ["Racism & Discrimination Support"] },
    ],
  },
  {
    label: "Practical & Social Needs",
    needs: [
      { id: "housing", label: "Housing or homelessness support", categoryNames: ["Emergency Accommodation", "Supported Housing", "Homelessness Recovery"] },
      { id: "employment", label: "Employment or training support", categoryNames: ["Employment for People in Recovery", "Job Training & Skills"] },
      { id: "debt", label: "Debt or financial difficulties", categoryNames: ["Debt Advice", "Financial Crisis Support"] },
      { id: "food", label: "Food or emergency aid", categoryNames: ["Foodbanks", "Community Food Support", "Food & Financial Support"] },
      { id: "furniture", label: "Furniture or household items needed", categoryNames: ["Low-Cost Furniture", "Community Sharing"] },
      { id: "advocacy", label: "Advocacy or legal support needed", categoryNames: ["Independent Advocacy", "Welfare & Housing Law"] },
      { id: "carers", label: "I am a carer and need support", categoryNames: ["Carers Support"] },
      { id: "young", label: "Support for a young person (11-25)", categoryNames: ["Young People (11-25)", "Youth Mental Health"] },
      { id: "women", label: "Women's specialist mental health services", categoryNames: ["Women's Mental Health Services"] },
      { id: "recovery", label: "Recovery, wellbeing, or maintaining progress", categoryNames: ["Recovery & Wellbeing"] },
    ],
  },
  {
    label: "Staff Wellbeing",
    needs: [
      { id: "awp_staff", label: "AWP staff wellbeing support", categoryNames: ["AWP Staff Wellbeing"] },
    ],
  },
];

interface ReportData {
  selectedNeeds: string[];
  matchedCategories: { name: string; services: { name: string; type: string | null; contacts: string }[] }[];
  date: string;
}

export function MyCarePath() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [report, setReport] = useState<ReportData | null>(null);
  const [hint, setHint] = useState("Select at least one need above");
  const { data: categories = [] } = useCategories();

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setReport(null);
    setHint("Select at least one need above");
  };

  const generateReport = () => {
    if (checked.size === 0) {
      setHint("⚠️ Please select at least one need");
      return;
    }

    const selectedNeeds: string[] = [];
    const matchedCategoryNames = new Set<string>();

    carePathNeeds.forEach((group) => {
      group.needs.forEach((need) => {
        if (checked.has(need.id)) {
          selectedNeeds.push(need.label);
          need.categoryNames.forEach((c) => matchedCategoryNames.add(c));
        }
      });
    });

    // Match category names to actual categories
    const matchedCats = categories.filter((c) => matchedCategoryNames.has(c.name));

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) +
      " at " + now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    setReport({
      selectedNeeds,
      matchedCategories: matchedCats.map((c) => ({ name: c.name, services: [] })),
      date: dateStr,
    });
  };

  const copyReport = () => {
    if (!report) return;
    const text = `My Care Path – Summary Report\nGenerated: ${report.date}\n\nIdentified Needs:\n${report.selectedNeeds.map((n) => `• ${n}`).join("\n")}\n\nMatched Categories:\n${report.matchedCategories.map((c) => `• ${c.name}`).join("\n")}\n\nThis report was generated from the Bristol Mental Health Signposting Directory.`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-primary border-b-[3px] border-b-accent pb-2">
        📋 My Care Path
      </h2>

      <div className="rounded-md border-l-4 border-l-accent bg-accent/10 p-4">
        <p className="text-sm text-foreground leading-relaxed">
          <strong>Build your personalised care summary.</strong> Tick the areas where you need support, then generate a mini-report you can print or show your <strong>BCC Social Worker</strong>, GP, or support worker. This helps them understand your needs quickly.
        </p>
      </div>

      {carePathNeeds.map((group) => (
        <div key={group.label} className="space-y-2">
          <h3 className="text-lg font-semibold text-primary pb-1 border-b-2 border-b-accent/40">
            {group.label}
          </h3>
          <div className="space-y-1">
            {group.needs.map((need) => (
              <label
                key={need.id}
                className="flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer hover:bg-accent/10 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checked.has(need.id)}
                  onChange={() => toggle(need.id)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">{need.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={generateReport}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <ClipboardList className="h-4 w-4" />
          Generate My Care Report
        </button>
        <span className={`text-sm ${hint.startsWith("⚠️") ? "text-destructive" : "text-muted-foreground"}`}>
          {hint}
        </span>
      </div>

      {report && (
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4 print:shadow-none" id="care-report">
          <h3 className="text-lg font-bold text-primary">📋 My Care Path – Summary Report</h3>
          <p className="text-xs text-muted-foreground">Generated: {report.date} | Bristol Mental Health Directory</p>

          <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
            <p className="text-sm text-amber-800">
              <strong>For discussion with your BCC Social Worker or support team.</strong> This is a self-identified needs summary – not a clinical assessment.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-foreground mb-2">🎯 Identified Needs ({report.selectedNeeds.length})</h4>
            <ul className="space-y-1">
              {report.selectedNeeds.map((n, i) => (
                <li key={i} className="text-sm text-foreground">• {n}</li>
              ))}
            </ul>
          </div>

          {report.matchedCategories.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-foreground mb-2">🏥 Matched Service Categories</h4>
              <ul className="space-y-1">
                {report.matchedCategories.map((c, i) => (
                  <li key={i} className="text-sm text-foreground">• {c.name}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 flex-wrap pt-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print Report
            </button>
            <button
              onClick={copyReport}
              className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <Copy className="h-4 w-4" />
              Copy to Clipboard
            </button>
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            This report was generated from the Bristol Mental Health Signposting Directory. For clinical advice, please consult your GP, care coordinator, or mental health professional.
          </p>
        </div>
      )}
    </div>
  );
}
