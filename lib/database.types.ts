export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      email_logs: {
        Row: {
          email: string
          error_message: string | null
          id: number
          scheduled_invoice_id: string
          sent_at: string | null
          status: string
        }
        Insert: {
          email: string
          error_message?: string | null
          id?: number
          scheduled_invoice_id: string
          sent_at?: string | null
          status: string
        }
        Update: {
          email?: string
          error_message?: string | null
          id?: number
          scheduled_invoice_id?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_scheduled_invoice_id_fkey"
            columns: ["scheduled_invoice_id"]
            isOneToOne: false
            referencedRelation: "scheduled_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_invoices: {
        Row: {
          amount: number
          concept: string
          created_at: string | null
          due_date_day: number
          email: string
          frequency: string
          id: string
          is_active: boolean | null
          last_sent: string | null
          next_send_date: string
        }
        Insert: {
          amount: number
          concept: string
          created_at?: string | null
          due_date_day: number
          email: string
          frequency: string
          id?: string
          is_active?: boolean | null
          last_sent?: string | null
          next_send_date: string
        }
        Update: {
          amount?: number
          concept?: string
          created_at?: string | null
          due_date_day?: number
          email?: string
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_sent?: string | null
          next_send_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never 