import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/hooks/useDirectoryData";

interface CategorySidebarProps {
  categories: Category[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function CategorySidebar({ categories, activeId, onSelect }: CategorySidebarProps) {
  return (
    <aside className="w-72 min-w-[280px] shrink-0 border-r border-border bg-sidebar-background overflow-y-auto max-h-[calc(100vh-160px)]">
      {categories.map((cat) => {
        const isSignposting = cat.sort_order === 0;
        const isActive = activeId === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "w-full flex items-center justify-between px-5 py-3.5 text-left text-sm font-medium border-b border-border/50 transition-colors",
              isSignposting && !isActive && "bg-primary text-primary-foreground hover:bg-primary/90 font-bold",
              isSignposting && isActive && "bg-primary text-primary-foreground font-bold border-l-4 border-l-accent",
              !isSignposting && !isActive && "bg-secondary/60 text-foreground hover:bg-secondary",
              !isSignposting && isActive && "bg-accent/15 text-primary font-semibold border-l-4 border-l-accent"
            )}
          >
            <span className="truncate pr-2">{cat.name}</span>
            <ChevronRight className={cn(
              "h-4 w-4 shrink-0 transition-colors",
              isActive && isSignposting && "text-accent",
              isActive && !isSignposting && "text-primary"
            )} />
          </button>
        );
      })}
    </aside>
  );
}
