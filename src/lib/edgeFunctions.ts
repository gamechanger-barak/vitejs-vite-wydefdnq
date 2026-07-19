import { supabase } from './supabaseClient';
import type {
  ProposeGameRequest,
  ProposeGameResponse,
  GenerateFinalGameRequest,
  GenerateFinalGameResponse,
} from '@/types';

export async function proposeGame(
  payload: ProposeGameRequest
): Promise<ProposeGameResponse> {
  const { data, error } = await supabase.functions.invoke<ProposeGameResponse>(
    'propose-game',
    { body: payload }
  );
  if (error) throw error;
  if (!data) throw new Error('propose-game returned no data');
  return data;
}

export async function generateFinalGame(
  payload: GenerateFinalGameRequest
): Promise<GenerateFinalGameResponse> {
  const { data, error } = await supabase.functions.invoke<GenerateFinalGameResponse>(
    'generate-final-game',
    { body: payload }
  );
  if (error) throw error;
  if (!data) throw new Error('generate-final-game returned no data');
  return data;
}
