// Supabase Edge Function: generate-final-game
// Deploy via the Supabase Dashboard web editor (single file, no external imports)
// or with: supabase functions deploy generate-final-game
// Requires secrets:
//   GEMINI_API_KEY            — supabase secrets set GEMINI_API_KEY=...
//   SUPABASE_URL              — injected automatically by the Supabase platform
//   SUPABASE_SERVICE_ROLE_KEY — injected automatically by the Supabase platform

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateFinalGameRequest {
  event_type: string;
  form_responses: Record<string, string | number>;
  chosen_game_title: string;
  game_type: string; // engine_id from game_engines, chosen during the propose-game step
}

interface GameEngineRow {
  id: string;
  display_name: string;
  vibe: string;
  schema_rules: unknown;
  content_principles: unknown;
  library_config: unknown;
}

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

Deno.serve(async (req: Request) => {
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

    // Identify the caller from their JWT so we can check subscription status
    // and stamp the correct user_id, even though writes use the service role.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userClient = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();

    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: profile, error: profileErr } = await adminClient
      .from('profiles')
      .select('is_subscribed')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile) {
      throw new Error('Could not load profile for subscription check');
    }

    if (!profile.is_subscribed) {
      return new Response(
        JSON.stringify({ error: 'An active subscription is required to generate a game' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: GenerateFinalGameRequest = await req.json();
    const { event_type, form_responses, chosen_game_title, game_type } = body;

    if (!event_type || !form_responses || !chosen_game_title || !game_type) {
      return new Response(
        JSON.stringify({
          error:
            'event_type, form_responses, chosen_game_title, and game_type are required',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Pull the specific engine's rules/principles/library config so Gemini
    // structures the final content array to match that engine exactly.
    const { data: engine, error: engineErr } = await adminClient
      .from('game_engines')
      .select('id, display_name, vibe, schema_rules, content_principles, library_config')
      .eq('id', game_type)
      .single();

    if (engineErr || !engine) {
      return new Response(
        JSON.stringify({ error: `Unknown game_type: ${game_type}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const engineRow = engine as GameEngineRow;

    const systemPrompt = `You are the game compiler for GameChanger. You are compiling
content for the "${engineRow.display_name}" engine (id: "${engineRow.id}"), whose
overall vibe is: ${engineRow.vibe}.

This engine's structural rules (follow exactly — these define the required shape of
the "content" field you output):
${JSON.stringify(engineRow.schema_rules)}

This engine's content principles (follow for tone, difficulty, and style):
${JSON.stringify(engineRow.content_principles)}

This engine's library configuration (word lists, card counts, category pools, or
other generation constraints to respect):
${JSON.stringify(engineRow.library_config)}

Using the chosen game title and the host's form answers, produce the complete
structured payload: full rules text and a "content" array/object shaped exactly
according to schema_rules above. Respond with strict JSON only, no markdown fences,
matching this shape:
{"game_title": string, "rules": string, "content": <shaped per schema_rules>}`;

    const userPrompt = `Event type: ${event_type}
Chosen game title: ${chosen_game_title}
Form responses: ${JSON.stringify(form_responses)}`;

    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: 'application/json',
          // No fixed responseSchema here: the shape of "content" varies per
          // engine (spyfall vs. wavelength vs. say_anything), so schema_rules
          // pulled from the DB — not a hardcoded schema — governs the shape.
          // Gemini is instructed above to follow schema_rules exactly.
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

    const gameData = JSON.parse(text);

    const { data: inserted, error: insertErr } = await adminClient
      .from('generated_games')
      .insert({
        user_id: user.id,
        game_data: { ...gameData, engine_id: engineRow.id },
      })
      .select('id')
      .single();

    if (insertErr || !inserted) {
      throw new Error(insertErr?.message ?? 'Failed to persist generated game');
    }

    return new Response(JSON.stringify({ success: true, game_id: inserted.id }), {
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
