import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Tipos para usar en la aplicación
export type ScheduledInvoice = Database['public']['Tables']['scheduled_invoices']['Row'];
export type EmailLog = Database['public']['Tables']['email_logs']['Row']; 