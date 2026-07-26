import { createClient } from '@supabase/supabase-js';

// Same project as the Minimal Clock mobile app, so accounts and shared
// countdowns are the same across web, iOS, and Android.
const SUPABASE_URL = 'https://mdnabqsrlsxioerlqeiw.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kbmFicXNybHN4aW9lcmxxZWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4ODI3NDIsImV4cCI6MjA5ODQ1ODc0Mn0.6hQ3RrCfG8Fm_fcnU1WKcMscApnNKTuOLx4LPmVjosA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface CountdownRow {
  id: string;
  owner_id: string;
  title: string;
  target_date: string;
  created_at: string;
}
