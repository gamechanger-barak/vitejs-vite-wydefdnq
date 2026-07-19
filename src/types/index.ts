// ---------------------------------------------------------------------------
// Database row types (mirrors supabase/schema.sql)
// ---------------------------------------------------------------------------

export interface Profile {
  id: string;
  email: string;
  is_subscribed: boolean;
  stripe_customer_id: string | null;
}

export type FieldType = 'textarea' | 'slider';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue: string | number; // Prevents uncontrolled-to-controlled React state shift bugs
}

export interface EventType {
  id: string;
  name: string;
  form_schema: FormField[];
}

export type FormResponseValue = string | number;
export type FormResponses = Record<string, FormResponseValue>;

export interface UserEvent {
  id: string;
  user_id: string;
  event_type_id: string;
  form_responses: FormResponses;
}

export interface GeneratedGame {
  id: string;
  user_id: string;
  game_data: Record<string, unknown>;
  created_at?: string;
}

// ---------------------------------------------------------------------------
// Edge Function contracts (Phase B / Phase C — see PRD section 3)
// ---------------------------------------------------------------------------

export interface ProposeGameRequest {
  event_type: string;
  form_responses: FormResponses;
  rejected_history: string[];
}

export interface ProposeGameResponse {
  game_title: string;
  concept_description: string;
  target_audience: string;
}

export interface GenerateFinalGameRequest {
  event_type: string;
  form_responses: FormResponses;
  chosen_game_title: string;
}

export interface GenerateFinalGameResponse {
  success: boolean;
  game_id: string;
}
