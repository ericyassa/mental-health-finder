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
    const { needs, synoptic, provider = "lovable", mode = "interim", consentShare, adjustments } = await req.json();

    const needsText = Array.isArray(needs) && needs.length ? needs.map((n: string) => `- ${n}`).join("\n") : "(none ticked)";
    const synopticText = Array.isArray(synoptic) && synoptic.length
      ? synoptic.map((s: { question: string; answer: string }) => `Q: ${s.question}\nA: ${s.answer}`).join("\n\n")
      : "(no synoptic input)";

    const systemPrompt = `You are a UK mental health support assistant helping staff produce a SHORT, practical interim plan for a service user who may wait months for professional help. Be succinct, warm, non-clinical, and signpost to free, evidence-informed UK self-help (NHS Every Mind Matters, Mind, Samaritans 116 123, Shout text 85258, SilverCloud, Hub of Hope, NHS Talking Therapies self-referral, etc.). Never diagnose. If risk/danger to self or others is mentioned, lead with crisis advice (999 / 111 option 2 / Samaritans / call police if danger to others).`;

    const interimPrompt = `Identified needs:\n${needsText}\n\nSynoptic snapshot:\n${synopticText}\n\nProduce a CONCISE interim plan with these short sections (use markdown headings, max ~180 words total):\n### 🌱 Recommended Starting Point\n(2-3 sentences, creative but realistic)\n### 🧰 Self-Help While Waiting\n(3-5 short bullet points — apps, websites, helplines, daily habits)\n### 📞 If Things Get Worse\n(1-2 lines on crisis routes)\n### ✅ First Small Step Today\n(1 sentence — one tiny action)`;

    const consentLine = typeof consentShare === "boolean"
      ? `\n\nConsent to share with professionals: ${consentShare ? "YES — service user consents" : "NO — do NOT share without re-asking consent"}.`
      : "";
    const adjustmentsLine = adjustments && String(adjustments).trim().length
      ? `\n\nReasonable adjustments / preferences requested: ${String(adjustments).trim()}`
      : "";

    const wellbeingPrompt = `Identified needs:\n${needsText}\n\nSynoptic snapshot:\n${synopticText}${consentLine}${adjustmentsLine}\n\nProduce a PERSONAL WELLBEING PLAN written in the first person ("I"), creative but grounded in the synoptic content. Keep it concise and scannable for a mental health nurse — aim for ~280 words total. Use these EXACT numbered markdown headings in this order, each followed by 1-3 short bullet points or 1-2 sentences:\n\n### 1. What Matters To You?\n### 2. What Has Happened? What Is The Situation?\n### 3. Long Term Goals\n### 4. Mental Health Goals & Agreed Actions\n### 5. Personal Safety Goals\n### 6. Physical Health Goals\n### 7. Early Warning Signs\n### 8. What Support Works For You\n### 9. Main Support / Next of Kin (NOK)\n### 10. Reasonable Adjustments\n\nIf consent is NO, add a one-line note at the top: "⚠️ Consent NOT given to share — discuss with service user before forwarding." Do not invent clinical diagnoses. Keep tone warm and recovery-focused.`;

    const safetyPrompt = `Identified needs:\n${needsText}\n\nSynoptic snapshot:\n${synopticText}${consentLine}${adjustmentsLine}\n\nProduce a SAFETY PLAN (Stanley-Brown style) tailored to the risks visible in the synoptic and ticked needs (self-harm, suicidal ideation, crisis, abuse, substance misuse, medication non-compliance). Keep it concise (~250 words), scannable, written in the first person where natural. Use these EXACT markdown headings in order:\n\n### 1. Warning Signs\n### 2. Internal Coping Strategies\n### 3. People & Social Settings That Distract\n### 4. People I Can Ask For Help\n### 5. Professionals & Crisis Contacts\n(Include Samaritans 116 123, Shout text 85258, NHS 111 option 2, 999, local crisis team placeholder.)\n### 6. Making The Environment Safer\n### 7. Reasons For Living / What Matters\n\nIf NO risks are evident in the input, return a single short paragraph: "No active risks identified at this time — review safety plan at next contact." Do not invent diagnoses. Tone: calm, practical, recovery-focused.`;

    const formulationPrompt = `Identified needs:\n${needsText}\n\nSynoptic snapshot:\n${synopticText}\n\nProduce a brief CLINICAL FORMULATION using the 5 Ps framework, written in clear professional language for a mental health nurse / care coordinator. Keep it concise (~280 words). Use these EXACT markdown headings in order, each followed by 2-4 short bullet points drawn from the synoptic content (do not invent facts):\n\n### 🧩 Presenting Problem\n(Current concerns, symptoms, functional impact.)\n### ⚓ Predisposing Factors\n(Background vulnerabilities — early life, trauma, family history, neurodevelopmental, long-term conditions.)\n### ⚡ Precipitating Factors\n(Recent triggers / events that brought issues to a head.)\n### 🔁 Perpetuating Factors\n(What keeps the problem going — unhelpful coping, isolation, substance use, sleep, relationships, medication issues.)\n### 🛡️ Protective Factors\n(Strengths, support network, coping skills, motivation, treatments that have helped before.)\n\nEnd with a 1-2 sentence "**Working hypothesis**" line summarising the formulation. Do not give a clinical diagnosis. If a section has no information in the input, write "Not yet known — explore at next contact."`;

    const userPrompt = mode === "wellbeing" ? wellbeingPrompt
      : mode === "safety" ? safetyPrompt
      : mode === "formulation" ? formulationPrompt
      : interimPrompt;

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
