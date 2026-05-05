// Care recommendation edge function — supports multiple AI providers:
// - "lovable"  (default, no API key needed)
// - "openai"   (requires OPENAI_API_KEY)
// - "gemini"   (requires GEMINI_API_KEY — Google AI Studio)
// - "copilot"  (Azure OpenAI: requires AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { needs, synoptic, provider = "lovable" } = await req.json();

    const needsText = Array.isArray(needs) && needs.length ? needs.map((n: string) => `- ${n}`).join("\n") : "(none ticked)";
    const synopticText = Array.isArray(synoptic) && synoptic.length
      ? synoptic.map((s: { question: string; answer: string }) => `Q: ${s.question}\nA: ${s.answer}`).join("\n\n")
      : "(no synoptic input)";

    const systemPrompt = `You are a UK mental health support assistant helping staff produce a SHORT, practical interim plan for a service user who may wait months for professional help. Be succinct, warm, non-clinical, and signpost to free, evidence-informed UK self-help (NHS Every Mind Matters, Mind, Samaritans 116 123, Shout text 85258, SilverCloud, Hub of Hope, NHS Talking Therapies self-referral, etc.). Never diagnose. If risk/danger to self or others is mentioned, lead with crisis advice (999 / 111 option 2 / Samaritans / call police if danger to others).`;

    const userPrompt = `Identified needs:\n${needsText}\n\nSynoptic snapshot:\n${synopticText}\n\nProduce a CONCISE interim plan with these short sections (use markdown headings, max ~180 words total):\n### 🌱 Recommended Starting Point\n(2-3 sentences, creative but realistic)\n### 🧰 Self-Help While Waiting\n(3-5 short bullet points — apps, websites, helplines, daily habits)\n### 📞 If Things Get Worse\n(1-2 lines on crisis routes)\n### ✅ First Small Step Today\n(1 sentence — one tiny action)`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    let url = "";
    let headers: Record<string, string> = { "Content-Type": "application/json" };
    let body: Record<string, unknown> = { messages };
    let extractContent: (data: any) => string = (d) => d?.choices?.[0]?.message?.content ?? "";

    if (provider === "openai") {
      const key = Deno.env.get("OPENAI_API_KEY");
      if (!key) return json({ error: "OPENAI_API_KEY not set. Add it in backend secrets to use OpenAI." }, 400);
      url = "https://api.openai.com/v1/chat/completions";
      headers.Authorization = `Bearer ${key}`;
      body.model = "gpt-4o-mini";
    } else if (provider === "gemini") {
      const key = Deno.env.get("GEMINI_API_KEY");
      if (!key) return json({ error: "GEMINI_API_KEY not set. Add it in backend secrets to use Google Gemini." }, 400);
      url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
      body = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      };
      extractContent = (d) => d?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
    } else if (provider === "copilot") {
      const key = Deno.env.get("AZURE_OPENAI_API_KEY");
      const endpoint = Deno.env.get("AZURE_OPENAI_ENDPOINT");
      const deployment = Deno.env.get("AZURE_OPENAI_DEPLOYMENT");
      if (!key || !endpoint || !deployment) {
        return json({ error: "Azure OpenAI not configured. Set AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT." }, 400);
      }
      url = `${endpoint.replace(/\/$/, "")}/openai/deployments/${deployment}/chat/completions?api-version=2024-06-01`;
      headers["api-key"] = key;
      body = { messages };
    } else {
      // default: lovable
      const key = Deno.env.get("LOVABLE_API_KEY");
      if (!key) return json({ error: "LOVABLE_API_KEY missing" }, 500);
      url = "https://ai.gateway.lovable.dev/v1/chat/completions";
      headers.Authorization = `Bearer ${key}`;
      body.model = "google/gemini-2.5-flash";
    }

    const resp = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });

    if (resp.status === 429) return json({ error: "Rate limit reached, please try again shortly." }, 429);
    if (resp.status === 402) return json({ error: "AI credits exhausted." }, 402);
    if (!resp.ok) {
      const t = await resp.text();
      console.error(`AI provider (${provider}) error`, resp.status, t);
      return json({ error: `${provider} error: ${resp.status}` }, 500);
    }

    const data = await resp.json();
    const recommendation = extractContent(data);
    return json({ recommendation, provider });
  } catch (e) {
    console.error("care-recommendation error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
