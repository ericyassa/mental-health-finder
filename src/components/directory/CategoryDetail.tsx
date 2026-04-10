import { Loader2 } from "lucide-react";
import { ServiceCard } from "./ServiceCard";
import { AppsSection } from "./AppsSection";
import { useServices, useServiceContacts, useApps } from "@/hooks/useDirectoryData";
import type { Category } from "@/hooks/useDirectoryData";

interface CategoryDetailProps {
  category: Category;
}

export function CategoryDetail({ category }: CategoryDetailProps) {
  const { data: services = [], isLoading: loadingServices } = useServices(category.id);
  const serviceIds = services.map((s) => s.id);
  const { data: contacts = [] } = useServiceContacts(serviceIds);
  const { data: apps = [] } = useApps(category.id);

  const servicesByType = services.reduce<Record<string, typeof services>>((acc, s) => {
    const key = s.type || "Services";
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  if (loadingServices) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="min-w-0">
        <h2 className="mb-4 break-words border-b-[3px] border-b-accent pb-2 text-2xl font-bold text-primary">
          {category.name}
        </h2>
        {category.description && (
          <div className="mb-6 rounded-md border-l-4 border-l-accent bg-accent/10 p-4">
            <p className="break-words text-sm text-foreground leading-relaxed">{category.description}</p>
          </div>
        )}
      </div>

      {Object.entries(servicesByType).map(([type, typeServices]) => (
        <div key={type} className="min-w-0">
          <h3 className="text-lg font-semibold text-primary mb-3 pb-1 border-b-2 border-b-accent/40">
            {type}
          </h3>
          <div className="min-w-0 space-y-3">
            {typeServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                contacts={contacts.filter((c) => c.service_id === service.id)}
              />
            ))}
          </div>
        </div>
      ))}

      <AppsSection apps={apps} />
    </div>
  );
}
