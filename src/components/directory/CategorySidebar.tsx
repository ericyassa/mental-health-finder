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
const SPECIAL_ITEMS_ORDER = ["Crisis Support (Urgent)", "Suicide Prevention", "AWP Staff Wellbeing"];

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
          <span className="flex items-center gap-2 truncate pr-2"><Home className="h-4 w-4 shrink-0" />{stripEmoji(signposting.name)}</span>
          <ChevronRight className="h-5 w-5 shrink-0" />
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
        <span className="flex items-center gap-2 truncate pr-2"><ClipboardList className="h-4 w-4 shrink-0" />My Care Path</span>
        <ChevronRight className="h-5 w-5 shrink-0" />
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
                "w-full flex items-center justify-between px-5 py-3 text-left text-sm font-semibold transition-colors",
                hasActiveChild || isOpen ? "bg-card text-[#3A7298] border-b-2 border-b-[#1a3a5c]" : "bg-secondary/40 text-[#3A7298] border-b border-border/50 hover:bg-secondary/60"
              )}
            >
              <span className="flex items-center gap-2 truncate pr-2">{GROUP_ICONS[groupName]}{stripEmoji(groupName)}</span>
              {isOpen ? (
                <ChevronDown className="h-5 w-5 shrink-0 text-green-500" />
              ) : (
                <ChevronRight className={cn("h-5 w-5 shrink-0", hasActiveChild ? "text-green-500" : "text-muted-foreground")} />
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
                        "w-full flex items-center justify-between pl-8 pr-5 py-2.5 text-left text-sm border-b border-dashed border-primary/40 transition-colors",
                        isActive
                          ? "bg-accent/15 text-primary font-semibold border-l-4 border-l-accent"
                          : "text-foreground hover:bg-secondary/40"
                      )}
                    >
                      <span className="truncate pr-2">{stripEmoji(cat.name)}</span>
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[#1a3a5c] shrink-0"><ChevronRight className="h-3.5 w-3.5 text-green-400" /></span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Special items at bottom — ordered: Crisis, Suicide, then AWP */}
      {specialCats
        .sort((a, b) => SPECIAL_ITEMS_ORDER.indexOf(a.name) - SPECIAL_ITEMS_ORDER.indexOf(b.name))
        .map((cat) => {
          const isActive = activeId === cat.id && !isCarePathActive;
          const isCrisis = cat.name.includes("Crisis");
          const isSuicide = cat.name.includes("Suicide");
          const isAWP = cat.name.includes("AWP");

          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={cn(
                "w-full flex items-center justify-between px-5 py-3.5 text-left text-sm font-bold border-b transition-colors",
                isCrisis && !isActive && "bg-destructive/15 text-destructive border-b-destructive/30 hover:bg-destructive/25",
                isCrisis && isActive && "bg-destructive/25 text-destructive border-l-4 border-l-destructive",
                isSuicide && !isActive && "bg-destructive/10 text-destructive/90 border-b-destructive/20 hover:bg-destructive/20",
                isSuicide && isActive && "bg-destructive/20 text-destructive border-l-4 border-l-destructive",
                isAWP && !isActive && "bg-accent/30 text-primary border-b-accent/40 hover:bg-accent/40",
                isAWP && isActive && "bg-accent/40 text-primary border-l-4 border-l-accent",
              )}
            >
              <span className="flex items-center gap-2 truncate pr-2">
                {isCrisis ? <AlertTriangle className="h-4 w-4 shrink-0" /> : isSuicide ? <ShieldAlert className="h-4 w-4 shrink-0" /> : <Smile className="h-4 w-4 shrink-0" />}
                {stripEmoji(cat.name)}
              </span>
              <ChevronRight className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
            </button>
          );
        })}
    </aside>
  );
}
