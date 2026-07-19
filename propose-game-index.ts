// Supabase Edge Function: propose-game
// Deploy via the Supabase Dashboard web editor (single file, no external imports)
// or with: supabase functions deploy propose-game
// Requires secrets:
//   GEMINI_API_KEY          — supabase secrets set GEMINI_API_KEY=...
//   SUPABASE_URL            — injected automatically by the Supabase platform
//   SUPABASE_SERVICE_ROLE_KEY — injected automatically by the Supabase platform

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProposeGameRequest {
  event_type: string;
  form_responses: Record<string, string | number>;
  rejected_history: string[];
}

interface ProposeGameResponse {
  engine_id: string;
  game_title: string;
  concept_description: string;
  target_audience: string;
}

interface GameEngineRow {
  id: string;
  display_name: string;
  vibe: string;
}

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

Deno.serve(async (req: Request) => {
  // Preflight — must return immediately with the shared CORS headers.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!apiKey || !supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required Edge Function secrets');
    }

    const body: ProposeGameRequest = await req.json();
    const { event_type, form_responses, rejected_history } = body;

    if (!event_type || !form_responses) {
      return new Response(
        JSON.stringify({ error: 'event_type and form_responses are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Admin client — used only to read the shared game_engines catalog.
    // This function never authenticates a specific user.
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: engines, error: enginesErr } = await adminClient
      .from('game_engines')
      .select('id, display_name, vibe');

    if (enginesErr) {
      throw new Error(`Failed to load game_engines: ${enginesErr.message}`);
    }

    if (!engines || engines.length === 0) {
      throw new Error('No rows found in game_engines');
    }

    const engineList = (engines as GameEngineRow[])
      .map((e) => `- id: "${e.id}" | display_name: "${e.display_name}" | vibe: ${e.vibe}`)
      .join('\n');

    const validIds = (engines as GameEngineRow[]).map((e) => e.id);

    const systemPrompt = `You are the game concept designer for GameChanger, an app that
turns a host's answers into a custom party/social game. You must choose exactly one
engine from the list below and propose a concept built on top of it. You may NEVER
invent an engine_id that is not in this list — pick the closest match.

Available engines:
${engineList}

Given the event type and the host's form answers, propose exactly one game concept
using one of the engines above. Never propose a title that appears in the rejected
list. Respond with strict JSON only, matching this shape:
{"engine_id": string, "game_title": string, "concept_description": string, "target_audience": string}
"engine_id" MUST be one of: ${validIds.map((id) => `"${id}"`).join(', ')}.
No markdown fences, no commentary outside the JSON object.`;

    const userPrompt = `Event type: ${event_type}
Form responses: ${JSON.stringify(form_responses)}
Already rejected titles (never repeat these): ${JSON.stringify(rejected_history ?? [])}`;

    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              engine_id: { type: 'STRING', enum: validIds },
              game_title: { type: 'STRING' },
              concept_description: { type: 'STRING' },
              target_audience: { type: 'STRING' },
            },
            required: ['engine_id', 'game_title', 'concept_description', 'target_audience'],
          },
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      throw new Error(`Gemini request failed: ${geminiRes.status} ${errText}`);
    }

    const geminiJson = await geminiRes.json();
    const text: string | undefined =
      geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Gemini response did not include a text payload');
    }

    const parsed: ProposeGameResponse = JSON.parse(text);

    // Belt-and-suspenders: even with the enum constraint and prompt guardrails,
    // verify the id against the fetched list before it goes back to the client.
    if (!validIds.includes(parsed.engine_id)) {
      throw new Error(`Gemini returned an unknown engine_id: ${parsed.engine_id}`);
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
