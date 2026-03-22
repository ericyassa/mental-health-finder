import { useState } from "react";
import { Star, Send, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export function FeedbackSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Please sign in to submit a rating", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("directory_ratings").insert({
      user_id: user.id,
      rating,
      comment: comment.trim() || null,
    });

    if (error) {
      toast({ title: "Error submitting rating", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
      toast({ title: "Thank you for your feedback!" });
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-primary mb-2">Tell us how you find this directory</h3>

      {submitted ? (
        <p className="text-sm text-accent-foreground bg-accent/15 rounded-md p-3">
          ✅ Thank you for your feedback! Your rating helps us improve.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="p-0.5 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    star <= (hoveredStar || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-sm text-muted-foreground ml-2">
                {rating}/5
              </span>
            )}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Any comments? (optional)"
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />

          <div className="flex items-center justify-between flex-wrap gap-2">
            <button
              onClick={handleSubmit}
              disabled={!user}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Submit Rating
            </button>
            {!user && (
              <span className="text-xs text-muted-foreground">Sign in to submit a rating</span>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          For ideas of improvements, email{" "}
          <a
            href="mailto:Eric.kamgou@nhs.net"
            className="text-primary font-medium hover:underline"
          >
            Eric.kamgou@nhs.net
          </a>
        </p>
      </div>
    </div>
  );
}
