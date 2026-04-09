import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Lock, User, ArrowLeft, UtensilsCrossed, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TEAMS = [
  "PCLS",
  "Bristol MH Triage",
  "CAMHS",
  "Crisis Team",
  "Community Mental Health Team",
  "Primary Care",
  "Inpatient Services",
  "Early Intervention",
  "Rehabilitation & Recovery",
  "Liaison Psychiatry",
];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [team, setTeam] = useState("");
  const [favoriteMeal, setFavoriteMeal] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showNewAccountPrompt, setShowNewAccountPrompt] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateSyntheticEmail = (name: string, teamName: string) => {
    const sanitized = `${name.trim().toLowerCase().replace(/\s+/g, "-")}-${teamName.trim().toLowerCase().replace(/\s+/g, "-")}`;
    return `${sanitized}@directory.local`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!team) {
      toast({ title: "Please select your team", variant: "destructive" });
      return;
    }

    setLoading(true);
    const syntheticEmail = generateSyntheticEmail(firstName, team);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email: syntheticEmail,
        password,
      });

      if (error) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= 3) {
          setShowNewAccountPrompt(true);
          toast({
            title: "Too many failed attempts",
            description: "You can create a new account to start fresh.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign in failed",
            description: `Incorrect details. ${3 - newAttempts} attempt(s) remaining.`,
            variant: "destructive",
          });
        }
      } else {
        setFailedAttempts(0);
        toast({ title: "Welcome back!" });
        navigate("/");
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email: syntheticEmail,
        password,
        options: {
          data: {
            display_name: firstName,
            team,
            favorite_meal: favoriteMeal,
          },
        },
      });

      if (error) {
        if (error.message?.includes("already registered")) {
          toast({
            title: "Account exists",
            description: "This name and team combination is already registered. Try signing in instead.",
            variant: "destructive",
          });
        } else {
          toast({ title: "Signup failed", description: error.message, variant: "destructive" });
        }
      } else {
        toast({ title: "Account created!", description: "You can now sign in." });
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  const handleCreateNewAccount = () => {
    setIsLogin(false);
    setShowNewAccountPrompt(false);
    setFailedAttempts(0);
    setFirstName("");
    setTeam("");
    setFavoriteMeal("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Heart className="h-6 w-6 text-accent" />
          <h1 className="text-lg font-bold">Bristol Mental Health Signposting Guide</h1>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to directory
          </button>

          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold text-primary mb-1">
              {isLogin ? "Sign In" : "Create Account"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {isLogin
                ? "Sign in with your name, team, and password"
                : "Create an account to personalise your experience"}
            </p>

            {showNewAccountPrompt && (
              <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm font-medium text-destructive mb-2">
                  3 failed attempts reached
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  You can create a new account to start fresh. Your previous bookmarks won't carry over.
                </p>
                <button
                  onClick={handleCreateNewAccount}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Create New Account
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Your first name"
                    className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Team</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                  <Select value={team} onValueChange={setTeam}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select your team" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAMS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">
                    Favourite Meal <span className="text-muted-foreground font-normal">(security question)</span>
                  </label>
                  <div className="relative">
                    <UtensilsCrossed className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={favoriteMeal}
                      onChange={(e) => setFavoriteMeal(e.target.value)}
                      placeholder="e.g. Sunday roast"
                      className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">This helps verify your identity — remember it!</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || (isLogin && showNewAccountPrompt)}
                className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>

            <p className="text-sm text-muted-foreground text-center mt-4">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setShowNewAccountPrompt(false);
                  setFailedAttempts(0);
                }}
                className="text-primary font-medium hover:underline"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            No personal email addresses are stored. Your identity is your name + team combination.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
