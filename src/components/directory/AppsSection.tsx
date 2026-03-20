import { ExternalLink } from "lucide-react";
import type { App } from "@/hooks/useDirectoryData";

interface AppsSectionProps {
  apps: App[];
}

export function AppsSection({ apps }: AppsSectionProps) {
  const nhsFree = apps.filter((a) => a.app_type === "nhs_free");
  const paidReliable = apps.filter((a) => a.app_type === "paid_reliable");

  if (!nhsFree.length && !paidReliable.length) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-foreground mb-4 pb-1 border-b border-border">
        📱 Recommended Apps
      </h3>
      <div className="flex flex-wrap gap-5">
        {nhsFree.length > 0 && (
          <AppList title="🏥 Free NHS Apps" apps={nhsFree} variant="nhs" />
        )}
        {paidReliable.length > 0 && (
          <AppList title="⭐ Paid / Reliable Apps" apps={paidReliable} variant="paid" />
        )}
      </div>
    </div>
  );
}

function AppList({ title, apps, variant }: { title: string; apps: App[]; variant: "nhs" | "paid" }) {
  return (
    <div className="flex-1 min-w-[280px] rounded-lg bg-muted p-4">
      <h4 className={`text-sm font-bold mb-3 pb-2 border-b border-border ${
        variant === "nhs" ? "text-primary" : "text-amber-600"
      }`}>
        {title}
      </h4>
      <ul className="space-y-2">
        {apps.map((app) => (
          <li key={app.id} className="text-sm">
            {app.link ? (
              <a
                href={app.link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-primary hover:underline inline-flex items-center gap-1"
              >
                {app.name}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="font-medium">{app.name}</span>
            )}
            {app.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{app.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
