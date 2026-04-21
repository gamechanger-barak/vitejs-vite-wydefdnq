import { createClient } from '@supabase/supabase-js';

// משיכת המפתחות מקובץ ה-env.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase Environment Variables');
}

// יצירת הלקוח וייצוא שלו
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);