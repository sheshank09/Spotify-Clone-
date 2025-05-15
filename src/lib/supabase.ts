import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmsvyjftbkfwbgqxonit.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtc3Z5amZ0Ymtmd2JncXhvbml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NDY1MDAsImV4cCI6MjA2MDIyMjUwMH0.tyUbIqG9Be2WzMluJLM_Y-f-_fWv5QCG2TS8T3Y23IE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize connection
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('Connected to Supabase:', session?.user?.email);
  }
});