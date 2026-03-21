import { useState, useMemo } from "react";
import { Search, Loader2, Heart } from "lucide-react";
import { useCategories } from "@/hooks/useDirectoryData";
import { CategorySidebar } from "@/components/directory/CategorySidebar";
import { CategoryDetail } from "@/components/directory/CategoryDetail";
import { WelcomePanel } from "@/components/directory/WelcomePanel";
import { MyCarePath } from "@/components/directory/MyCarePath";

const Index = () => {
  const { data: categories = [], isLoading } = useCategories();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCarePath, setShowCarePath] = useState(false);

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeCategoryId) ?? null,
    [categories, activeCategoryId]
  );

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  const signpostingBoard = categories.find((c) => c.sort_order === 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentCategory = activeCategory ?? signpostingBoard ?? null;
  const isWelcome = !showCarePath && currentCategory?.sort_order === 0;

  const handleSelectCategory = (id: string) => {
    setActiveCategoryId(id);
    setShowCarePath(false);
  };

  const handleSelectCarePath = () => {
    setShowCarePath(true);
    setActiveCategoryId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 px-6 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
          <Heart className="h-8 w-8 text-accent" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Bristol Mental Health Signposting Guide</h1>
            <p className="text-sm opacity-90 mt-1">
              A comprehensive directory of mental health services and support in Bristol
            </p>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="bg-muted border-b border-border px-6 py-3">
        <div className="max-w-7xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conditions or services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-[calc(100vh-160px)]">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <CategorySidebar
            categories={filteredCategories}
            activeId={currentCategory?.id ?? null}
            onSelect={handleSelectCategory}
            onSelectCarePath={handleSelectCarePath}
            isCarePathActive={showCarePath}
          />
        </div>

        {/* Mobile category select */}
        <div className="md:hidden w-full px-4 pt-3">
          <select
            value={showCarePath ? "__carepath__" : (currentCategory?.id ?? "")}
            onChange={(e) => {
              if (e.target.value === "__carepath__") {
                handleSelectCarePath();
              } else {
                handleSelectCategory(e.target.value);
              }
            }}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
          >
            <option value="__carepath__">📋 My Care Path</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Content area */}
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-160px)]">
          {showCarePath ? (
            <MyCarePath />
          ) : currentCategory && isWelcome ? (
            <WelcomePanel
              description={currentCategory.description}
              categories={categories}
              onSelectCategory={handleSelectCategory}
            />
          ) : currentCategory ? (
            <CategoryDetail category={currentCategory} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a category to get started
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
