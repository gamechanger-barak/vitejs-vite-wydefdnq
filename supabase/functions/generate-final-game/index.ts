// Supabase Edge Function: generate-final-game
// Deploy with: supabase functions deploy generate-final-game
// Requires secrets:
//   supabase secrets set GEMINI_API_KEY=...
//   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically
//   by the Supabase platform into every Edge Function's environment.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface GenerateFinalGameRequest {
  event_type: string;
  form_responses: Record<string, string | number>;
  chosen_game_title: string;
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
    const { event_type, form_responses, chosen_game_title } = body;

    if (!event_type || !form_responses || !chosen_game_title) {
      return new Response(
        JSON.stringify({
          error: 'event_type, form_responses, and chosen_game_title are required',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are the game compiler for GameChanger. Produce the complete
structured payload for the chosen game concept: full rules text, a rounds/phases
structure, and a set of question or challenge cards appropriate to the event type and
the host's form answers. Respond with strict JSON only, no markdown fences.`;

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
          responseSchema: {
            type: 'OBJECT',
            properties: {
              game_title: { type: 'STRING' },
              rules: { type: 'STRING' },
              rounds: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    title: { type: 'STRING' },
                    instructions: { type: 'STRING' },
                    cards: {
                      type: 'ARRAY',
                      items: { type: 'STRING' },
                    },
                  },
                  required: ['title', 'instructions', 'cards'],
                },
              },
            },
            required: ['game_title', 'rules', 'rounds'],
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

    const gameData = JSON.parse(text);

    const { data: inserted, error: insertErr } = await adminClient
      .from('generated_games')
      .insert({ user_id: user.id, game_data: gameData })
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
