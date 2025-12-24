import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hbbjxqrhgaptypycbyts.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiYmp4cXJoZ2FwdHlweWNieXRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NzgyNzIsImV4cCI6MjA4MTM1NDI3Mn0.vy3o9-cKOq3Bt57N9KmSeMEegzTJ2c8yACAuRxgoJHY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
