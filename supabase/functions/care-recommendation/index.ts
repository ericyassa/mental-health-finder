// Care recommendation edge function — uses Lovable AI to generate succinct
// self-help suggestions while the person waits for professional support.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { needs, synoptic } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const needsText = Array.isArray(needs) && needs.length ? needs.map((n: string) => `- ${n}`).join("\n") : "(none ticked)";
    const synopticText = Array.isArray(synoptic) && synoptic.length
      ? synoptic.map((s: { question: string; answer: string }) => `Q: ${s.question}\nA: ${s.answer}`).join("\n\n")
      : "(no synoptic input)";

    const systemPrompt = `You are a UK mental health support assistant helping staff produce a SHORT, practical interim plan for a service user who may wait months for professional help. Be succinct, warm, non-clinical, and signpost to free, evidence-informed UK self-help (NHS Every Mind Matters, Mind, Samaritans 116 123, Shout text 85258, SilverCloud, Hub of Hope, NHS Talking Therapies self-referral, etc.). Never diagnose. If risk/danger to self or others is mentioned, lead with crisis advice (999 / 111 option 2 / Samaritans / call police if danger to others).`;

    const userPrompt = `Identified needs:\n${needsText}\n\nSynoptic snapshot:\n${synopticText}\n\nProduce a CONCISE interim plan with these short sections (use markdown headings, max ~180 words total):\n### 🌱 Recommended Starting Point\n(2-3 sentences, creative but realistic)\n### 🧰 Self-Help While Waiting\n(3-5 short bullet points — apps, websites, helplines, daily habits)\n### 📞 If Things Get Worse\n(1-2 lines on crisis routes)\n### ✅ First Small Step Today\n(1 sentence — one tiny action)`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limit reached, please try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up Lovable AI usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const recommendation = data?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ recommendation }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("care-recommendation error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
