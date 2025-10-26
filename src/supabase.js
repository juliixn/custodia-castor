
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://esgohggunlromwjyhyrh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzZ29oZ2d1bmxyb213anloeXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MjYwMDEsImV4cCI6MjA3NzAwMjAwMX0.a-NcNULiB9uijE0ZGW9i4oXvE2VBh9wt4_KsMgTZwNE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
