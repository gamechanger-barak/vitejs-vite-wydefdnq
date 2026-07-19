// Supabase Edge Function: propose-game
// Deploy with: supabase functions deploy propose-game
// Requires secret: supabase secrets set GEMINI_API_KEY=...

import { corsHeaders } from '../_shared/cors.ts';

interface ProposeGameRequest {
  event_type: string;
  form_responses: Record<string, string | number>;
  rejected_history: string[];
}

interface ProposeGameResponse {
  game_title: string;
  concept_description: string;
  target_audience: string;
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
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY secret is not configured');
    }

    const body: ProposeGameRequest = await req.json();
    const { event_type, form_responses, rejected_history } = body;

    if (!event_type || !form_responses) {
      return new Response(
        JSON.stringify({ error: 'event_type and form_responses are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are the game concept designer for GameChanger, an app that
turns a host's answers into a custom party/social game. Given the event type and the
host's form answers, propose exactly one game concept. Never propose a title that
appears in the rejected list. Respond with strict JSON only, matching this shape:
{"game_title": string, "concept_description": string, "target_audience": string}
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
              game_title: { type: 'STRING' },
              concept_description: { type: 'STRING' },
              target_audience: { type: 'STRING' },
            },
            required: ['game_title', 'concept_description', 'target_audience'],
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
