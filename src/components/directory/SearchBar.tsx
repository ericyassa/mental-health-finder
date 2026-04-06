import { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, FolderOpen, FileText, Smartphone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { Category } from "@/hooks/useDirectoryData";

interface SearchResult {
  id: string;
  name: string;
  type: "category" | "service" | "app";
  categoryId: string;
  categoryName: string;
  description?: string | null;
}

interface SearchBarProps {
  categories: Category[];
  onSelectCategory: (categoryId: string) => void;
}

export function SearchBar({ categories, onSelectCategory }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Fetch all services for searching
  const { data: allServices = [] } = useQuery({
    queryKey: ["all_services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, category_id, description, sort_order")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  // Fetch all apps for searching
  const { data: allApps = [] } = useQuery({
    queryKey: ["all_apps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("apps")
        .select("id, name, category_id, description, sort_order")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  // Build category lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  // Filter results
  const results = useMemo((): SearchResult[] => {
    const q = debouncedQuery.toLowerCase().trim();
    if (q.length < 2) return [];

    const matched: SearchResult[] = [];

    // Search categories
    categories.forEach((c) => {
      if (c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)) {
        matched.push({
          id: c.id,
          name: c.name,
          type: "category",
          categoryId: c.id,
          categoryName: c.name,
          description: c.description,
        });
      }
    });

    // Search services
    allServices.forEach((s) => {
      if (s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)) {
        matched.push({
          id: s.id,
          name: s.name,
          type: "service",
          categoryId: s.category_id,
          categoryName: categoryMap.get(s.category_id) ?? "Unknown",
          description: s.description,
        });
      }
    });

    // Search apps
    allApps.forEach((a) => {
      if (a.name.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q)) {
        matched.push({
          id: a.id,
          name: a.name,
          type: "app",
          categoryId: a.category_id,
          categoryName: categoryMap.get(a.category_id) ?? "Unknown",
          description: a.description,
        });
      }
    });

    return matched.slice(0, 15);
  }, [debouncedQuery, categories, allServices, allApps, categoryMap]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (result: SearchResult) => {
    onSelectCategory(result.categoryId);
    setQuery("");
    setIsOpen(false);
  };

  const typeIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "category": return <FolderOpen className="h-3.5 w-3.5 shrink-0 text-primary" />;
      case "service": return <FileText className="h-3.5 w-3.5 shrink-0 text-green-600" />;
      case "app": return <Smartphone className="h-3.5 w-3.5 shrink-0 text-purple-600" />;
    }
  };

  const typeLabel = (type: SearchResult["type"]) => {
    switch (type) {
      case "category": return "Category";
      case "service": return "Service";
      case "app": return "App";
    }
  };

  return (
    <div className="bg-muted border-b border-border px-6 py-3">
      <div className="max-w-7xl mx-auto relative" ref={containerRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search categories, services, or apps..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          onKeyDown={(e) => {
            if (!isOpen || results.length === 0) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
            } else if (e.key === "Enter" && activeIndex >= 0) {
              e.preventDefault();
              handleSelect(results[activeIndex]);
            } else if (e.key === "Escape") {
              setIsOpen(false);
            }
          }}
          className="w-full rounded-lg border border-input bg-background px-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-colors"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}

        {/* Results dropdown */}
        {isOpen && results.length > 0 && (
          <div className="absolute z-50 top-full mt-1 w-full bg-background border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {results.map((result, index) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleSelect(result)}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-border/30 last:border-b-0",
                  index === activeIndex ? "bg-muted" : "hover:bg-muted/60"
                )}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div className="mt-0.5">{typeIcon(result.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{result.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                      {typeLabel(result.type)}
                    </span>
                  </div>
                  {result.type !== "category" && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      in {result.categoryName}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {isOpen && debouncedQuery.trim().length >= 2 && results.length === 0 && (
          <div className="absolute z-50 top-full mt-1 w-full bg-background border border-border rounded-lg shadow-lg px-4 py-3 text-sm text-muted-foreground">
            No results found for "{debouncedQuery}"
          </div>
        )}
      </div>
    </div>
  );
}

// Simple debounce hook
function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
