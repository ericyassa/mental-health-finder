import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import { Printer, Copy, Sparkles, Loader2, ShieldCheck, Download, RotateCcw, Stethoscope, FileText, ClipboardCheck, FileDown, HeartHandshake, ShieldAlert, Brain, Activity } from "lucide-react";
import { Screeners } from "./Screeners";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCategories } from "@/hooks/useDirectoryData";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
    label: "Medication & Medical Review",
    needs: [
      { id: "med_gp_review", label: "Needs a GP medication review", categoryNames: [] },
      { id: "med_side_effects", label: "Experiencing medication side effects", categoryNames: [] },
      { id: "med_non_compliant", label: "Not taking medication as prescribed (non-compliance)", categoryNames: [] },
      { id: "med_ineffective", label: "Current medication feels ineffective / not working", categoryNames: [] },
      { id: "med_crisis", label: "Urgent crisis team medication attention required", categoryNames: ["Crisis Support (Urgent)"] },
      { id: "med_overdue_review", label: "Last medication review was over 6 months ago / unknown", categoryNames: [] },
      { id: "med_running_out", label: "Running out of medication / repeat prescription needed", categoryNames: [] },
      { id: "med_polypharmacy", label: "Taking multiple medications – concerns about interactions", categoryNames: [] },
      { id: "med_missed_doses", label: "Frequently missing or forgetting doses", categoryNames: [] },
      { id: "med_depot", label: "Due / overdue for depot injection", categoryNames: ["Crisis Support (Urgent)"] },
    ],
  },
  {
    label: "Physical Health",
    needs: [
      { id: "ph_chronic", label: "Chronic physical health condition (e.g. diabetes, COPD, heart disease)", categoryNames: ["Physical Health & Wellbeing"] },
      { id: "ph_pain", label: "Persistent or chronic pain", categoryNames: ["Physical Health & Wellbeing"] },
      { id: "ph_sleep", label: "Sleep problems / insomnia", categoryNames: ["Physical Health & Wellbeing"] },
      { id: "ph_weight", label: "Weight, nutrition or eating concerns", categoryNames: ["Physical Health & Wellbeing"] },
      { id: "ph_activity", label: "Low physical activity / sedentary lifestyle", categoryNames: ["Physical Health & Wellbeing"] },
      { id: "ph_smoking", label: "Smoking, vaping or wants to quit", categoryNames: ["Physical Health & Wellbeing"] },
      { id: "ph_smi_check", label: "Overdue annual SMI physical health check", categoryNames: ["Physical Health & Wellbeing"] },
      { id: "ph_dental", label: "Dental or oral health needs", categoryNames: ["Physical Health & Wellbeing"] },
      { id: "ph_sexual", label: "Sexual health concerns", categoryNames: ["Physical Health & Wellbeing"] },
      { id: "ph_pregnancy", label: "Pregnancy or postnatal physical health", categoryNames: ["Physical Health & Wellbeing"] },
    ],
  },
];

// Synoptic clinical questions — free-text responses
const synopticQuestions = [
  { id: "syn_diagnosis", label: "Previous and current mental health diagnoses (if any)", placeholder: "e.g. Depression (2019), current GAD diagnosis…" },
  { id: "syn_current_issues", label: "What are the current issues / main concerns right now? (brief summary)", placeholder: "e.g. Low mood for 3 months, poor sleep, isolating from family, struggling at work…" },
  { id: "syn_therapy", label: "Have you had therapy or psychological support before? What kind, and was it helpful?", placeholder: "e.g. CBT in 2021 — helpful for anxiety; counselling at university…" },
  { id: "syn_coping", label: "What coping mechanisms or strategies do you use (helpful or unhelpful)?", placeholder: "e.g. walking, journalling, breathing exercises; also drinking when stressed…" },
  { id: "syn_support", label: "Who is in your current support network (family, friends, professionals)?", placeholder: "e.g. partner, GP, sister, peer support group…" },
  { id: "syn_goals", label: "What would you like to achieve? What are your goals for support?", placeholder: "e.g. manage anxiety, return to work, improve sleep, rebuild confidence…" },
];

interface ReportData {
  selectedNeeds: string[];
  matchedCategories: { name: string; services: { name: string; type: string | null; contacts: string }[] }[];
  synoptic: { question: string; answer: string }[];
  date: string;
}

// Module-level cache so navigating away and back preserves clinician work
const cache: {
  checked: Set<string>;
  synoptic: Record<string, string>;
  report: ReportData | null;
  aiRecommendation: string;
  wellbeingPlan: string;
  safetyPlan: string;
  formulation: string;
  adjustments: string;
  consentShare: boolean | null;
} = {
  checked: new Set(),
  synoptic: {},
  report: null,
  aiRecommendation: "",
  wellbeingPlan: "",
  safetyPlan: "",
  formulation: "",
  adjustments: "",
  consentShare: null,
};

export function MyCarePath() {
  const [checked, setChecked] = useState<Set<string>>(cache.checked);
  const [synoptic, setSynoptic] = useState<Record<string, string>>(cache.synoptic);
  const [report, setReport] = useState<ReportData | null>(cache.report);
  const [hint, setHint] = useState("Select at least one need above");
  const [aiRecommendation, setAiRecommendation] = useState<string>(cache.aiRecommendation);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string>("");
  const [wellbeingPlan, setWellbeingPlan] = useState<string>(cache.wellbeingPlan);
  const [wellbeingLoading, setWellbeingLoading] = useState(false);
  const [wellbeingError, setWellbeingError] = useState<string>("");
  const [safetyPlan, setSafetyPlan] = useState<string>(cache.safetyPlan);
  const [safetyLoading, setSafetyLoading] = useState(false);
  const [safetyError, setSafetyError] = useState<string>("");
  const [formulation, setFormulation] = useState<string>(cache.formulation);
  const [formulationLoading, setFormulationLoading] = useState(false);
  const [formulationError, setFormulationError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("clinical");
  const provider = "lovable" as const;
  const { data: categories = [] } = useCategories();

  // Sync state to module cache so it persists across unmount
  useEffect(() => { cache.checked = checked; }, [checked]);
  useEffect(() => { cache.synoptic = synoptic; }, [synoptic]);
  useEffect(() => { cache.report = report; }, [report]);
  useEffect(() => { cache.aiRecommendation = aiRecommendation; }, [aiRecommendation]);
  useEffect(() => { cache.wellbeingPlan = wellbeingPlan; }, [wellbeingPlan]);
  useEffect(() => { cache.safetyPlan = safetyPlan; }, [safetyPlan]);
  useEffect(() => { cache.formulation = formulation; }, [formulation]);


  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setHint("Select at least one need above");
  };

  const handleReset = () => {
    setChecked(new Set());
    setSynoptic({});
    setReport(null);
    setAiRecommendation("");
    setAiError("");
    setWellbeingPlan("");
    setWellbeingError("");
    setSafetyPlan("");
    setSafetyError("");
    setFormulation("");
    setFormulationError("");
    setAdjustments("");
    setConsentShare(null);
    setActiveTab("clinical");
    setHint("Select at least one need above");
  };

  const fetchAiRecommendation = async (needs: string[], synopticAnswers: { question: string; answer: string }[]) => {
    setAiLoading(true);
    setAiError("");
    setAiRecommendation("");
    try {
      const { data, error } = await supabase.functions.invoke("care-recommendation", {
        body: { needs, synoptic: synopticAnswers, provider },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAiRecommendation(data?.recommendation || "");
    } catch (e: any) {
      setAiError(e?.message || "Could not generate AI recommendation. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const [consentOpen, setConsentOpen] = useState(false);
  const [consentShare, setConsentShare] = useState<boolean | null>(null);
  const [adjustments, setAdjustments] = useState("");

  const openWellbeingPrompt = () => {
    const hasSynoptic = synopticQuestions.some((q) => (synoptic[q.id] || "").trim().length > 0);
    if (checked.size === 0 && !hasSynoptic) {
      setHint("⚠️ Please tick at least one need or fill in a synoptic question");
      return;
    }
    setConsentShare(null);
    setAdjustments("");
    setConsentOpen(true);
  };

  const fetchWellbeingPlan = async () => {
    const selectedNeeds: string[] = [];
    carePathNeeds.forEach((g) => g.needs.forEach((n) => { if (checked.has(n.id)) selectedNeeds.push(n.label); }));
    const synopticAnswers = synopticQuestions
      .map((q) => ({ question: q.label, answer: (synoptic[q.id] || "").trim() }))
      .filter((s) => s.answer.length > 0);

    setConsentOpen(false);
    setWellbeingLoading(true);
    setWellbeingError("");
    setWellbeingPlan("");
    try {
      const { data, error } = await supabase.functions.invoke("care-recommendation", {
        body: { needs: selectedNeeds, synoptic: synopticAnswers, provider, mode: "wellbeing", consentShare, adjustments },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setWellbeingPlan(data?.recommendation || "");
    } catch (e: any) {
      setWellbeingError(e?.message || "Could not generate wellbeing plan. Please try again.");
    } finally {
      setWellbeingLoading(false);
    }
  };

  const generateReport = () => {
    const hasSynoptic = synopticQuestions.some((q) => (synoptic[q.id] || "").trim().length > 0);
    if (checked.size === 0 && !hasSynoptic) {
      setHint("⚠️ Please tick at least one need or fill in a synoptic question");
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

    const matchedCats = categories.filter((c) => matchedCategoryNames.has(c.name));

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) +
      " at " + now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    const synopticAnswers = synopticQuestions
      .map((q) => ({ question: q.label, answer: (synoptic[q.id] || "").trim() }))
      .filter((s) => s.answer.length > 0);

    setReport({
      selectedNeeds,
      matchedCategories: matchedCats.map((c) => ({ name: c.name, services: [] })),
      synoptic: synopticAnswers,
      date: dateStr,
    });

    // Kick off AI recommendation in parallel
    fetchAiRecommendation(selectedNeeds, synopticAnswers);
  };

  const buildReportText = () => {
    if (!report) return "";
    const synopticBlock = report.synoptic.length > 0
      ? `\n\nSynoptic View:\n${report.synoptic.map((s) => `• ${s.question}\n   ${s.answer}`).join("\n")}`
      : "";
    const aiBlock = aiRecommendation ? `\n\n--- Suggested Interim Plan (AI-generated) ---\n${aiRecommendation}` : "";
    const wellbeingBlock = wellbeingPlan ? `\n\n--- Personal Wellbeing Plan (AI-generated) ---\n${wellbeingPlan}` : "";
    return `My Care Path – Summary Report\nGenerated: ${report.date}\n\nIdentified Needs:\n${report.selectedNeeds.map((n) => `• ${n}`).join("\n")}\n\nMatched Categories:\n${report.matchedCategories.map((c) => `• ${c.name}`).join("\n")}${synopticBlock}${aiBlock}${wellbeingBlock}\n\nThis report was generated from the Bristol Mental Health Signposting Directory. Not a clinical assessment.`;
  };

  const copyReport = () => {
    const text = buildReportText();
    if (text) navigator.clipboard.writeText(text);
  };

  const downloadReport = () => {
    const text = buildReportText();
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `care-path-report-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPdf = (title: string, body: string, filename: string) => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;
    let y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(40, 90, 130);
    doc.text(title, margin, y);
    y += 22;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Generated: ${new Date().toLocaleString("en-GB")} • Bristol MH Directory`, margin, y);
    y += 18;
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 14;

    doc.setTextColor(30);
    const lines = body.replace(/\*\*/g, "").split("\n");
    for (const raw of lines) {
      const line = raw.replace(/^###\s*/, "").replace(/^##\s*/, "").replace(/^#\s*/, "");
      const isHeading = /^###\s|^##\s|^#\s/.test(raw) || /^\d+\.\s+[A-Z]/.test(raw.trim());
      doc.setFont("helvetica", isHeading ? "bold" : "normal");
      doc.setFontSize(isHeading ? 12 : 10);
      doc.setTextColor(isHeading ? 40 : 30, isHeading ? 90 : 30, isHeading ? 130 : 30);
      const wrapped = doc.splitTextToSize(line || " ", maxWidth);
      for (const w of wrapped) {
        if (y > pageHeight - margin) { doc.addPage(); y = margin; }
        doc.text(w, margin, y);
        y += isHeading ? 16 : 13;
      }
      if (isHeading) y += 2;
    }

    doc.save(filename);
  };

  const downloadReportPdf = () => {
    if (!report) return;
    const body = buildReportText();
    downloadPdf("Clinical Summary Report", body, `clinical-summary-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const downloadWellbeingPdf = () => {
    if (!wellbeingPlan) return;
    downloadPdf("Personal Wellbeing Plan (PWP)", wellbeingPlan, `personal-wellbeing-plan-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const collectInputs = () => {
    const selectedNeeds: string[] = [];
    carePathNeeds.forEach((g) => g.needs.forEach((n) => { if (checked.has(n.id)) selectedNeeds.push(n.label); }));
    const synopticAnswers = synopticQuestions
      .map((q) => ({ question: q.label, answer: (synoptic[q.id] || "").trim() }))
      .filter((s) => s.answer.length > 0);
    return { selectedNeeds, synopticAnswers };
  };

  const guardInputs = () => {
    const hasSynoptic = synopticQuestions.some((q) => (synoptic[q.id] || "").trim().length > 0);
    if (checked.size === 0 && !hasSynoptic) {
      setHint("⚠️ Please tick at least one need or fill in a synoptic question");
      return false;
    }
    return true;
  };

  const fetchSafetyPlan = async () => {
    if (!guardInputs()) return;
    const { selectedNeeds, synopticAnswers } = collectInputs();
    setSafetyLoading(true); setSafetyError(""); setSafetyPlan("");
    try {
      const { data, error } = await supabase.functions.invoke("care-recommendation", {
        body: { needs: selectedNeeds, synoptic: synopticAnswers, provider, mode: "safety", consentShare, adjustments },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSafetyPlan(data?.recommendation || "");
    } catch (e: any) {
      setSafetyError(e?.message || "Could not generate safety plan.");
    } finally { setSafetyLoading(false); }
  };

  const fetchFormulation = async () => {
    if (!guardInputs()) return;
    const { selectedNeeds, synopticAnswers } = collectInputs();
    setFormulationLoading(true); setFormulationError(""); setFormulation("");
    try {
      const { data, error } = await supabase.functions.invoke("care-recommendation", {
        body: { needs: selectedNeeds, synoptic: synopticAnswers, provider, mode: "formulation" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setFormulation(data?.recommendation || "");
    } catch (e: any) {
      setFormulationError(e?.message || "Could not generate formulation.");
    } finally { setFormulationLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-3 border-b-[3px] border-b-accent pb-2 flex-wrap">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6" />
          My Care Path
        </h2>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
          title="Clear all selections, synoptic answers, and generated reports"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Care Path
        </button>
      </div>

      <div className="rounded-md border-l-4 border-l-accent bg-accent/10 p-4">
        <p className="text-sm text-foreground leading-relaxed">
          <strong>Build a clinical summary in three quick steps:</strong> <span className="font-semibold text-primary">1.</span> Tick the areas of support that apply, <span className="font-semibold text-primary">2.</span> complete the synoptic clinical information below, then <span className="font-semibold text-primary">3.</span> generate the <strong>Clinical Summary Report</strong> and the <strong>Personal Wellbeing Plan (PWP)</strong>. Both can be downloaded as PDF to share with the GP, care coordinator, or social worker.
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

      {/* Synoptic View — quick clinical snapshot */}
      <div className="space-y-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-5 shadow-sm">
        <div className="flex items-start gap-3 border-b border-primary/15 pb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"><Stethoscope className="h-5 w-5" /></div>
          <div>
            <h3 className="text-lg font-bold text-primary">Synoptic View – Quick Snapshot</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Six short questions to give the support worker a fast clinical picture. Optional – fill in what is comfortable to share.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {synopticQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-lg border border-primary/15 bg-card/60 p-3 shadow-sm transition-shadow hover:shadow-md"
            >
              <label htmlFor={q.id} className="flex items-start gap-2 mb-2 text-sm font-semibold text-primary">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {idx + 1}
                </span>
                <span className="leading-tight">{q.label}</span>
              </label>
              <textarea
                id={q.id}
                value={synoptic[q.id] || ""}
                onChange={(e) => setSynoptic((p) => ({ ...p, [q.id]: e.target.value }))}
                placeholder={q.placeholder}
                rows={2}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Output Tabs framework */}
      <div className="rounded-xl border-2 border-primary/20 bg-card p-4 shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-1 bg-muted/50 p-1">
            <TabsTrigger value="screeners" className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Activity className="h-4 w-4" />
              <span className="text-xs font-semibold">Screeners</span>
            </TabsTrigger>
            <TabsTrigger value="clinical" className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-4 w-4" />
              <span className="text-xs font-semibold">Clinical Summary</span>
            </TabsTrigger>
            <TabsTrigger value="pwp" className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <HeartHandshake className="h-4 w-4" />
              <span className="text-xs font-semibold">Wellbeing Plan</span>
            </TabsTrigger>
            <TabsTrigger value="safety" className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
              <ShieldAlert className="h-4 w-4" />
              <span className="text-xs font-semibold">Safety Plan</span>
            </TabsTrigger>
            <TabsTrigger value="formulation" className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Brain className="h-4 w-4" />
              <span className="text-xs font-semibold">Formulation (5Ps)</span>
            </TabsTrigger>
          </TabsList>

          {/* SCREENERS TAB */}
          <TabsContent value="screeners" className="mt-4">
            <Screeners />
          </TabsContent>


          {/* CLINICAL SUMMARY TAB */}
          <TabsContent value="clinical" className="mt-4 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={generateReport} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                <FileText className="h-4 w-4" /> Generate Clinical Summary
              </button>
              <span className={`text-sm ${hint.startsWith("⚠️") ? "text-destructive" : "text-muted-foreground"}`}>{hint}</span>
            </div>

            {report && (
              <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4 print:shadow-none" id="care-report">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2"><FileText className="h-5 w-5" /> Clinical Summary Report</h3>
                <p className="text-xs text-muted-foreground">Generated: {report.date} | Bristol Mental Health Directory</p>
                <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
                  <p className="text-sm text-amber-800"><strong>For discussion with your BCC Social Worker or support team.</strong> Self-identified needs summary – not a clinical assessment.</p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-2">🎯 Identified Needs ({report.selectedNeeds.length})</h4>
                  <ul className="space-y-1">{report.selectedNeeds.map((n, i) => (<li key={i} className="text-sm">• {n}</li>))}</ul>
                </div>
                {report.matchedCategories.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-2">🏥 Matched Service Categories</h4>
                    <ul className="space-y-1">{report.matchedCategories.map((c, i) => (<li key={i} className="text-sm">• {c.name}</li>))}</ul>
                  </div>
                )}
                {report.synoptic.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5"><Stethoscope className="h-4 w-4 text-primary" /> Synoptic View</h4>
                    <ul className="space-y-2">
                      {report.synoptic.map((s, i) => (
                        <li key={i} className="text-sm"><div className="font-medium">• {s.question}</div><div className="pl-4 text-muted-foreground whitespace-pre-wrap">{s.answer}</div></li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-4 space-y-2">
                  <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><h4 className="text-sm font-bold text-primary">Suggested Interim Plan – While You Wait</h4></div>
                  {aiLoading && (<div className="flex items-center gap-2 text-sm text-muted-foreground py-2"><Loader2 className="h-4 w-4 animate-spin" /> Crafting…</div>)}
                  {aiError && (<div className="text-sm text-destructive py-2">{aiError}<button onClick={() => fetchAiRecommendation(report.selectedNeeds, report.synoptic)} className="ml-2 underline">Retry</button></div>)}
                  {aiRecommendation && !aiLoading && (
                    <div className="prose prose-sm max-w-none text-foreground prose-headings:text-primary prose-headings:font-semibold prose-headings:text-sm prose-p:my-1 prose-ul:my-1">
                      <ReactMarkdown>{aiRecommendation}</ReactMarkdown>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap pt-2">
                  <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"><Printer className="h-4 w-4" /> Print</button>
                  <button onClick={downloadReportPdf} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:bg-accent/90"><FileDown className="h-4 w-4" /> PDF</button>
                  <button onClick={downloadReport} className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80"><Download className="h-4 w-4" /> .txt</button>
                  <button onClick={copyReport} className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80"><Copy className="h-4 w-4" /> Copy</button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* PWP TAB */}
          <TabsContent value="pwp" className="mt-4 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={openWellbeingPrompt} disabled={wellbeingLoading} className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90 disabled:opacity-60">
                {wellbeingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <HeartHandshake className="h-4 w-4" />}
                Generate Personal Wellbeing Plan
              </button>
              <span className="text-xs text-muted-foreground">You'll be asked about consent & adjustments first.</span>
            </div>
            {(wellbeingPlan || wellbeingError) && (
              <div className="rounded-lg border-2 border-accent/40 bg-accent/5 p-6 shadow-sm space-y-3 print:shadow-none" id="wellbeing-plan">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2"><HeartHandshake className="h-5 w-5" /> Personal Wellbeing Plan</h3>
                  {wellbeingPlan && (
                    <div className="flex gap-2">
                      <button onClick={() => navigator.clipboard.writeText(wellbeingPlan)} className="inline-flex items-center gap-1 rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold"><Copy className="h-3 w-3" /> Copy</button>
                      <button onClick={downloadWellbeingPdf} className="inline-flex items-center gap-1 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground"><FileDown className="h-3 w-3" /> PDF</button>
                    </div>
                  )}
                </div>
                {wellbeingError && (<div className="text-sm text-destructive py-2">{wellbeingError}<button onClick={fetchWellbeingPlan} className="ml-2 underline">Retry</button></div>)}
                {wellbeingPlan && (
                  <div className="space-y-4 text-foreground [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:px-3 [&_h3]:py-2 [&_h3]:rounded-md [&_h3]:bg-primary [&_h3]:text-primary-foreground [&_h3]:text-sm [&_h3]:font-semibold [&_h3:first-child]:mt-0 [&_p]:text-sm [&_p]:my-1.5 [&_ul]:my-1.5 [&_li]:text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:text-primary">
                    <ReactMarkdown>{wellbeingPlan}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* SAFETY PLAN TAB */}
          <TabsContent value="safety" className="mt-4 space-y-4">
            <div className="rounded-md border-l-4 border-l-destructive bg-destructive/5 p-3">
              <p className="text-sm text-foreground"><strong className="text-destructive">Safety Plan</strong> — generated from the synoptic & risk indicators above. Always co-produce with the service user.</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={fetchSafetyPlan} disabled={safetyLoading} className="inline-flex items-center gap-2 rounded-lg bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-60">
                {safetyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
                Generate Safety Plan
              </button>
            </div>
            {(safetyPlan || safetyError) && (
              <div className="rounded-lg border-2 border-destructive/40 bg-destructive/5 p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-lg font-bold text-destructive flex items-center gap-2"><ShieldAlert className="h-5 w-5" /> Safety Plan</h3>
                  {safetyPlan && (
                    <div className="flex gap-2">
                      <button onClick={() => navigator.clipboard.writeText(safetyPlan)} className="inline-flex items-center gap-1 rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold"><Copy className="h-3 w-3" /> Copy</button>
                      <button onClick={() => downloadPdf("Safety Plan", safetyPlan, `safety-plan-${new Date().toISOString().slice(0,10)}.pdf`)} className="inline-flex items-center gap-1 rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground"><FileDown className="h-3 w-3" /> PDF</button>
                    </div>
                  )}
                </div>
                {safetyError && (<div className="text-sm text-destructive py-2">{safetyError}<button onClick={fetchSafetyPlan} className="ml-2 underline">Retry</button></div>)}
                {safetyPlan && (
                  <div className="space-y-3 text-foreground [&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:px-3 [&_h3]:py-2 [&_h3]:rounded-md [&_h3]:bg-destructive [&_h3]:text-destructive-foreground [&_h3]:text-sm [&_h3]:font-semibold [&_h3:first-child]:mt-0 [&_p]:text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_li]:text-sm [&_strong]:text-destructive">
                    <ReactMarkdown>{safetyPlan}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* FORMULATION TAB */}
          <TabsContent value="formulation" className="mt-4 space-y-4">
            <div className="rounded-md border-l-4 border-l-primary bg-primary/5 p-3">
              <p className="text-sm text-foreground"><strong className="text-primary">Formulation (5 Ps)</strong> — Presenting · Predisposing · Precipitating · Perpetuating · Protective. A working hypothesis to share with the MDT.</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={fetchFormulation} disabled={formulationLoading} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                {formulationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                Generate 5Ps Formulation
              </button>
            </div>
            {(formulation || formulationError) && (
              <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2"><Brain className="h-5 w-5" /> Clinical Formulation (5Ps)</h3>
                  {formulation && (
                    <div className="flex gap-2">
                      <button onClick={() => navigator.clipboard.writeText(formulation)} className="inline-flex items-center gap-1 rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold"><Copy className="h-3 w-3" /> Copy</button>
                      <button onClick={() => downloadPdf("Clinical Formulation (5Ps)", formulation, `formulation-5ps-${new Date().toISOString().slice(0,10)}.pdf`)} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><FileDown className="h-3 w-3" /> PDF</button>
                    </div>
                  )}
                </div>
                {formulationError && (<div className="text-sm text-destructive py-2">{formulationError}<button onClick={fetchFormulation} className="ml-2 underline">Retry</button></div>)}
                {formulation && (
                  <div className="space-y-3 text-foreground [&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:px-3 [&_h3]:py-2 [&_h3]:rounded-md [&_h3]:bg-primary [&_h3]:text-primary-foreground [&_h3]:text-sm [&_h3]:font-semibold [&_h3:first-child]:mt-0 [&_p]:text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_li]:text-sm [&_strong]:text-primary">
                    <ReactMarkdown>{formulation}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Consent & Adjustments Dialog (used by PWP) */}
      <Dialog open={consentOpen} onOpenChange={setConsentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Consent & Adjustments</DialogTitle>
            <DialogDescription>Before we generate the wellbeing plan, please confirm a couple of things with the service user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Do you consent to this information being shared with professionals (GP, care team, social worker)?</p>
              <div className="flex gap-2">
                <Button type="button" variant={consentShare === true ? "default" : "outline"} size="sm" onClick={() => setConsentShare(true)}>Yes, I consent</Button>
                <Button type="button" variant={consentShare === false ? "default" : "outline"} size="sm" onClick={() => setConsentShare(false)}>No, do not share</Button>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="adjustments" className="block text-sm font-medium">Any reasonable adjustments needed? <span className="text-muted-foreground font-normal">(e.g. easy-read, interpreter, sensory)</span></label>
              <textarea id="adjustments" value={adjustments} onChange={(e) => setAdjustments(e.target.value)} placeholder="Optional — leave blank if none" rows={3} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConsentOpen(false)}>Cancel</Button>
            <Button onClick={fetchWellbeingPlan} disabled={consentShare === null}><Sparkles className="h-4 w-4" /> Generate Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
