import { useState, useMemo } from "react";
import { Search, Loader2, Heart, LogIn, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCategories } from "@/hooks/useDirectoryData";
import { useAuth } from "@/hooks/useAuth";
import { CategorySidebar } from "@/components/directory/CategorySidebar";
import { CategoryDetail } from "@/components/directory/CategoryDetail";
import { WelcomePanel } from "@/components/directory/WelcomePanel";
import { MyCarePath } from "@/components/directory/MyCarePath";
import { FeedbackSection } from "@/components/directory/FeedbackSection";

const Index = () => {
  const { data: categories = [], isLoading } = useCategories();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-accent" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Bristol Mental Health Signposting Guide</h1>
              <p className="text-sm opacity-90 mt-1">
                A comprehensive directory of mental health services and support in Bristol
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden md:inline text-xs opacity-80">
                  <User className="h-3.5 w-3.5 inline mr-1" />
                  {user.email}
                </span>
                <button
                  onClick={signOut}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary-foreground/10 px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:bg-accent/90 transition-colors"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign In
              </button>
            )}
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
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row flex-1 min-h-0">
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

          {/* Feedback section */}
          <div className="mt-8">
            <FeedbackSection />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-4 px-6 mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs opacity-80">
            © {new Date().getFullYear()} Bristol Mental Health Signposting Guide — AWP NHS Foundation Trust. All rights reserved.
          </p>
          <p className="text-xs opacity-60 mt-1">
            This directory is for informational purposes only. For medical emergencies, call 999.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
