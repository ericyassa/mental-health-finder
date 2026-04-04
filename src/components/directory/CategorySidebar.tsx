import { useState } from "react";
import {
  ChevronRight, ChevronDown, Home, ClipboardList, Brain, Users, House,
  Briefcase, Coins, Scale, UtensilsCrossed, Armchair, UserRound,
  HeartPulse, GraduationCap, Globe, Accessibility, TreePine, Handshake,
  AlertTriangle, ShieldAlert, Smile
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/hooks/useDirectoryData";

// Map group names to Lucide icons
const GROUP_ICONS: Record<string, React.ReactNode> = {
  "🧠 Mental Health Conditions": <Brain className="h-4 w-4 shrink-0" />,
  "👨‍👩‍👧 Youth & Family Support": <Users className="h-4 w-4 shrink-0" />,
  "🏠 Housing & Homelessness": <House className="h-4 w-4 shrink-0" />,
  "💼 Employment Support": <Briefcase className="h-4 w-4 shrink-0" />,
  "💰 Financial & Debt Support": <Coins className="h-4 w-4 shrink-0" />,
  "⚖️ Advocacy & Legal Support": <Scale className="h-4 w-4 shrink-0" />,
  "🍞 Food & Emergency Aid": <UtensilsCrossed className="h-4 w-4 shrink-0" />,
  "🪑 Furniture & Household Support": <Armchair className="h-4 w-4 shrink-0" />,
  "👴 Older Adults & Ageing": <UserRound className="h-4 w-4 shrink-0" />,
  "🏥 Physical Health & Wellbeing": <HeartPulse className="h-4 w-4 shrink-0" />,
  "🎓 Education & Learning": <GraduationCap className="h-4 w-4 shrink-0" />,
  "🌍 Cultural & Community Support": <Globe className="h-4 w-4 shrink-0" />,
  "♿ Disability & Accessibility": <Accessibility className="h-4 w-4 shrink-0" />,
  "🌿 Nature & Creative Therapies": <TreePine className="h-4 w-4 shrink-0" />,
  "🤝 Community & Volunteering": <Handshake className="h-4 w-4 shrink-0" />,
};

// Strip emoji prefix for clean display
const stripEmoji = (name: string) => name.replace(/^[\p{Emoji}\p{Emoji_Component}\uFE0F\u200D]+\s*/u, "");

// Define the order of accordion groups
const ACCORDION_GROUP_ORDER = [
  "🧠 Mental Health Conditions",
  "👨‍👩‍👧 Youth & Family Support",
  "🏠 Housing & Homelessness",
  "💼 Employment Support",
  "💰 Financial & Debt Support",
  "⚖️ Advocacy & Legal Support",
  "🍞 Food & Emergency Aid",
  "🪑 Furniture & Household Support",
  "👴 Older Adults & Ageing",
  "🏥 Physical Health & Wellbeing",
  "🎓 Education & Learning",
  "🌍 Cultural & Community Support",
  "♿ Disability & Accessibility",
  "🌿 Nature & Creative Therapies",
  "🤝 Community & Volunteering",
];

// Special ungrouped items shown at bottom
const SPECIAL_ITEMS = ["Crisis Support (Urgent)", "Suicide Prevention", "AWP Staff Wellbeing"];

interface CategorySidebarProps {
  categories: Category[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onSelectCarePath: () => void;
  isCarePathActive: boolean;
}

export function CategorySidebar({ categories, activeId, onSelect, onSelectCarePath, isCarePathActive }: CategorySidebarProps) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(group) ? next.delete(group) : next.add(group);
      return next;
    });
  };

  // Find signposting board
  const signposting = categories.find((c) => c.sort_order === 0);

  // Group categories by sidebar_group
  const grouped = new Map<string, Category[]>();
  const specialCats: Category[] = [];

  categories.forEach((cat) => {
    if (cat.sort_order === 0) return; // signposting board handled separately
    if (SPECIAL_ITEMS.includes(cat.name)) {
      specialCats.push(cat);
      return;
    }
    if (cat.sidebar_group) {
      const existing = grouped.get(cat.sidebar_group) || [];
      existing.push(cat);
      grouped.set(cat.sidebar_group, existing);
    }
  });

  // Ensure active item's group is open
  const activeCategory = categories.find((c) => c.id === activeId);
  if (activeCategory?.sidebar_group && !openGroups.has(activeCategory.sidebar_group)) {
    // Auto-expand on render
  }

  return (
    <aside className="w-72 min-w-[280px] shrink-0 border-r border-border bg-sidebar-background overflow-y-auto max-h-[calc(100vh-160px)]">
      {/* Signposting Board */}
      {signposting && (
        <button
          onClick={() => onSelect(signposting.id)}
          className={cn(
            "w-full flex items-center justify-between px-5 py-3.5 text-left text-sm font-bold border-b border-border/50 transition-colors",
            activeId === signposting.id && !isCarePathActive
              ? "bg-primary text-primary-foreground border-l-4 border-l-accent"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          <span className="truncate pr-2">🏠 {signposting.name.replace("🏠 ", "")}</span>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </button>
      )}

      {/* My Care Path */}
      <button
        onClick={onSelectCarePath}
        className={cn(
          "w-full flex items-center justify-between px-5 py-3.5 text-left text-sm font-bold border-b border-border/50 transition-colors",
          isCarePathActive
            ? "bg-accent/20 text-primary border-l-4 border-l-accent"
            : "bg-accent/10 text-primary hover:bg-accent/20"
        )}
      >
        <span className="truncate pr-2">📋 My Care Path</span>
        <ChevronRight className="h-4 w-4 shrink-0" />
      </button>

      {/* Accordion Groups */}
      {ACCORDION_GROUP_ORDER.map((groupName) => {
        const children = grouped.get(groupName);
        if (!children || children.length === 0) return null;
        const isOpen = openGroups.has(groupName);
        const hasActiveChild = children.some((c) => c.id === activeId && !isCarePathActive);

        return (
          <div key={groupName}>
            <button
              onClick={() => toggleGroup(groupName)}
              className={cn(
                "w-full flex items-center justify-between px-5 py-3 text-left text-sm font-semibold border-b border-border/50 transition-colors",
                hasActiveChild ? "bg-primary/10 text-primary" : "bg-secondary/40 text-foreground hover:bg-secondary/60"
              )}
            >
              <span className="truncate pr-2">{groupName}</span>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </button>
            {isOpen && (
              <div>
                {children.map((cat) => {
                  const isActive = activeId === cat.id && !isCarePathActive;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => onSelect(cat.id)}
                      className={cn(
                        "w-full flex items-center justify-between pl-8 pr-5 py-2.5 text-left text-sm border-b border-border/30 transition-colors",
                        isActive
                          ? "bg-accent/15 text-primary font-semibold border-l-4 border-l-accent"
                          : "text-foreground hover:bg-secondary/40"
                      )}
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                      <ChevronRight className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Special items at bottom */}
      {specialCats.map((cat) => {
        const isActive = activeId === cat.id && !isCarePathActive;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "w-full flex items-center justify-between px-5 py-3.5 text-left text-sm font-medium border-b border-border/50 transition-colors",
              isActive
                ? "bg-accent/15 text-primary font-semibold border-l-4 border-l-accent"
                : "bg-secondary/60 text-foreground hover:bg-secondary"
            )}
          >
            <span className="truncate pr-2">{cat.name}</span>
            <ChevronRight className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
          </button>
        );
      })}
    </aside>
  );
}
