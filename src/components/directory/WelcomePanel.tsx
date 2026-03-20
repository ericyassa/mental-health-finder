import type { Category } from "@/hooks/useDirectoryData";

interface WelcomePanelProps {
  description: string | null;
  categories: Category[];
  onSelectCategory: (id: string) => void;
}

export function WelcomePanel({ description, categories, onSelectCategory }: WelcomePanelProps) {
  return (
    <div className="space-y-6 max-w-3xl">
      {description && (
        <div className="rounded-lg border-l-4 border-l-accent bg-accent/10 p-5">
          <p className="text-sm text-foreground leading-relaxed">{description}</p>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-5 shadow-sm border-l-4 border-l-primary">
        <h3 className="text-lg font-semibold text-primary mb-3">How to Use This Guide</h3>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          This directory provides signposting information for mental health conditions and services available in Bristol. Select a condition from the left panel to see relevant services, contacts, and recommended apps.
        </p>
        <ul className="space-y-2">
          {["Browse categories on the left to find relevant services",
            "Each service includes contact details and referral information",
            "Recommended NHS and paid apps are listed where available",
            "Use the search bar to quickly find specific services"].map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
              <span className="text-accent font-bold">✓</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 shadow-sm border-l-4 border-l-primary">
        <h3 className="text-lg font-semibold text-primary mb-3">Recovery Pathway</h3>
        {[
          { step: "Step 1: Recognise", desc: "Notice changes in your mental health and acknowledge them." },
          { step: "Step 2: Reach Out", desc: "Talk to someone you trust or contact a helpline." },
          { step: "Step 3: Get Support", desc: "Access professional services through GP or self-referral." },
          { step: "Step 4: Build Recovery", desc: "Use ongoing support, apps, and community resources." },
        ].map((p) => (
          <div key={p.step} className="border-l-[3px] border-l-primary bg-background rounded p-3 mb-3 shadow-sm">
            <strong className="text-sm text-primary block mb-1">{p.step}</strong>
            <p className="text-sm text-muted-foreground">{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-accent/10 border border-accent/30 p-5">
        <h3 className="text-base font-semibold text-foreground mb-2">Quick Access to Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.filter(c => c.sort_order > 0).slice(0, 12).map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
