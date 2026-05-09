import { createSupabaseBrowserClient } from './supabase/client';
import { Database } from './database.types';

export const supabase = createSupabaseBrowserClient();

export type ScheduledInvoice = Database['public']['Tables']['scheduled_invoices']['Row'];
export type EmailLog = Database['public']['Tables']['email_logs']['Row'];
