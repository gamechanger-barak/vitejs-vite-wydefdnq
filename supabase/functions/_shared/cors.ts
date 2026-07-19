// Shared across every Edge Function so preflight handling stays consistent.
// Import with: import { corsHeaders } from '../_shared/cors.ts'
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
