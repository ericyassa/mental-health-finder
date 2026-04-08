import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isNhsEmail = (email: string) => email.trim().toLowerCase().endsWith("@nhs.net");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && !isNhsEmail(email)) {
      toast({
        title: "NHS email required",
        description: "Only @nhs.net email addresses can register. Please use your NHS email.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Welcome back!" });
        navigate("/");
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Check your email", description: "We sent you a verification link to confirm your account." });
      }
    }
    setLoading(false);
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
                ? "Sign in to rate and bookmark services"
                : "Create an account to personalise your experience"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isLogin ? "you@nhs.net" : "yourname@nhs.net"}
                    className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
              </div>

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
                disabled={loading}
                className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>

            <p className="text-sm text-muted-foreground text-center mt-4">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-medium hover:underline"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
