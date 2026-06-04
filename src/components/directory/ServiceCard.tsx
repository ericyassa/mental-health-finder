import { ExternalLink, Phone, Mail, Globe, MapPin, Info, ClipboardList } from "lucide-react";
import type { Service, ServiceContact } from "@/hooks/useDirectoryData";
import { formatContact } from "@/lib/contactFormat";

interface ServiceCardProps {
  service: Service;
  contacts: ServiceContact[];
}

const contactIcons: Record<string, React.ReactNode> = {
  Phone: <Phone className="h-3.5 w-3.5" />,
  Email: <Mail className="h-3.5 w-3.5" />,
  Website: <Globe className="h-3.5 w-3.5" />,
  Address: <MapPin className="h-3.5 w-3.5" />,
};

export function ServiceCard({ service, contacts }: ServiceCardProps) {
  const isClinicalTool = service.type?.toLowerCase().includes("clinical tool");

  return (
    <div
      className={
        isClinicalTool
          ? "w-full overflow-hidden rounded-lg border-2 border-primary bg-primary/5 p-4 shadow-md transition-all hover:shadow-lg ring-1 ring-primary/20"
          : "w-full overflow-hidden rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:border-accent hover:shadow-md"
      }
    >
      {isClinicalTool && (
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
          <ClipboardList className="h-3 w-3" />
          Clinical Tool · Staff Use
        </div>
      )}
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          {service.link ? (
            <a
              href={service.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full items-start gap-1.5 text-base font-bold text-primary hover:underline"
            >
              <span className="break-words">{service.name}</span>
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            </a>
          ) : (
            <h4 className="break-words text-base font-bold text-primary">{service.name}</h4>
          )}
        </div>
        {service.type && !isClinicalTool && (
          <span className="max-w-full self-start rounded bg-accent/30 px-2.5 py-0.5 text-xs font-bold leading-snug text-accent-foreground">
            {service.type}
          </span>
        )}
      </div>

      {service.description && (
        <p className="mb-3 break-words text-sm italic leading-relaxed text-muted-foreground">
          {service.description}
        </p>
      )}

      {contacts.length > 0 && (
        <div className="space-y-1.5 border-t border-dashed border-border pt-3">
          {contacts.map((c) => {
            const { href, display, valid } = formatContact(c.type, c.value);
            return (
              <div key={c.id} className="flex min-w-0 items-start gap-2 text-sm">
                <span className="flex min-w-[80px] shrink-0 items-center gap-1.5 font-semibold text-foreground">
                  {contactIcons[c.type] || <Info className="h-3.5 w-3.5" />}
                  {c.type}:
                </span>
                {href && valid ? (
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="min-w-0 break-all text-primary hover:underline"
                  >
                    {display}
                  </a>
                ) : (
                  <span
                    className={`min-w-0 break-all ${valid ? "text-muted-foreground" : "text-destructive"}`}
                    title={valid ? undefined : "Invalid format"}
                  >
                    {display}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
