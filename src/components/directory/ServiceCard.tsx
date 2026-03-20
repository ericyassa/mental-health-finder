import { ExternalLink, Phone, Mail, Globe, MapPin, Info } from "lucide-react";
import type { Service, ServiceContact } from "@/hooks/useDirectoryData";

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
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm hover:border-accent hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          {service.link ? (
            <a
              href={service.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-bold text-primary hover:underline inline-flex items-center gap-1.5"
            >
              {service.name}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <h4 className="text-base font-bold text-primary">{service.name}</h4>
          )}
        </div>
        {service.type && (
          <span className="shrink-0 rounded bg-accent/30 px-2.5 py-0.5 text-xs font-bold text-accent-foreground">
            {service.type}
          </span>
        )}
      </div>

      {service.description && (
        <p className="text-sm text-muted-foreground italic mb-3 leading-relaxed">
          {service.description}
        </p>
      )}

      {contacts.length > 0 && (
        <div className="border-t border-dashed border-border pt-3 space-y-1.5">
          {contacts.map((c) => (
            <div key={c.id} className="flex items-start gap-2 text-sm">
              <span className="flex items-center gap-1.5 min-w-[80px] font-semibold text-foreground shrink-0">
                {contactIcons[c.type] || <Info className="h-3.5 w-3.5" />}
                {c.type}:
              </span>
              <span className="text-muted-foreground break-all">{c.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
