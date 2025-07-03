import { supabase, ScheduledInvoice } from './supabase';

class SupabaseDatabaseManager {
  
  async createScheduledInvoice(invoice: Omit<ScheduledInvoice, 'id' | 'created_at' | 'next_send_date'>): Promise<string> {
    const nextSendDate = this.calculateNextSendDate(invoice.frequency as 'monthly' | 'biweekly', invoice.due_date_day);
    
    // Determinar el status basado en si es activa o no
    // Activa = Programada (se enviará automáticamente)
    // Inactiva = Pendiente (ya se envió o está esperando pago)
    const status = invoice.is_active ? 'Programada' : 'Pendiente';

    const { data, error } = await supabase
      .from('scheduled_invoices')
      .insert({
        email: invoice.email,
        amount: invoice.amount,
        frequency: invoice.frequency,
        due_date_day: invoice.due_date_day,
        concept: invoice.concept,
        is_active: invoice.is_active,
        last_sent: invoice.last_sent,
        status: status,
        next_send_date: nextSendDate
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creando factura programada:', error);
      throw new Error(`Error creando factura: ${error.message}`);
    }

    return data.id;
  }

  async getActiveScheduledInvoices(): Promise<ScheduledInvoice[]> {
    const { data, error } = await supabase
      .from('scheduled_invoices')
      .select('*')
      .eq('is_active', true)
      .order('next_send_date', { ascending: true });

    if (error) {
      console.error('Error obteniendo facturas activas:', error);
      throw new Error(`Error obteniendo facturas: ${error.message}`);
    }

    return data || [];
  }

  // Nuevo método para obtener TODAS las facturas (activas e inactivas)
  async getAllInvoices(): Promise<ScheduledInvoice[]> {
    const { data, error } = await supabase
      .from('scheduled_invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo todas las facturas:', error);
      throw new Error(`Error obteniendo facturas: ${error.message}`);
    }

    return data || [];
  }

  async getInvoicesDueToday(): Promise<ScheduledInvoice[]> {
    // Usar zona horaria de Colombia (UTC-5)
    const currentDate = new Date();
    const colombiaDate = new Date(currentDate.toLocaleString("en-US", {timeZone: "America/Bogota"}));
    const today = colombiaDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('scheduled_invoices')
      .select('*')
      .eq('is_active', true)
      .lte('next_send_date', today)
      .order('next_send_date', { ascending: true });

    if (error) {
      console.error('Error obteniendo facturas vencidas:', error);
      throw new Error(`Error obteniendo facturas vencidas: ${error.message}`);
    }

    console.log(`🔍 [Colombia UTC-5] Verificando facturas para: ${today}`);
    return data || [];
  }

  async updateLastSent(id: string): Promise<void> {
    // Primero obtener la factura actual para calcular la próxima fecha
    const { data: invoice, error: fetchError } = await supabase
      .from('scheduled_invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error obteniendo factura:', fetchError);
      throw new Error(`Error obteniendo factura: ${fetchError.message}`);
    }

    if (!invoice) {
      throw new Error('Factura no encontrada');
    }

    const now = new Date().toISOString();
    const nextSendDate = this.calculateNextSendDate(invoice.frequency as 'monthly' | 'biweekly', invoice.due_date_day);

    const { error } = await supabase
      .from('scheduled_invoices')
      .update({
        last_sent: now,
        next_send_date: nextSendDate
      })
      .eq('id', id);

    if (error) {
      console.error('Error actualizando última fecha de envío:', error);
      throw new Error(`Error actualizando factura: ${error.message}`);
    }
  }

  // Nuevo método para crear un registro histórico cuando se envía una factura programada
  async createInvoiceHistoryRecord(originalInvoice: ScheduledInvoice): Promise<string> {
    // Usar zona horaria de Colombia para la fecha de envío
    const currentDate = new Date();
    const colombiaDate = new Date(currentDate.toLocaleString("en-US", {timeZone: "America/Bogota"}));
    const colombiaDateString = colombiaDate.toISOString();
    
    const { data, error } = await supabase
      .from('scheduled_invoices')
      .insert({
        email: originalInvoice.email,
        amount: originalInvoice.amount,
        frequency: originalInvoice.frequency,
        due_date_day: originalInvoice.due_date_day,
        concept: originalInvoice.concept,
        is_active: false, // No es activa porque es un registro histórico
        last_sent: colombiaDateString, // Se marca como enviada en este momento
        status: 'Pendiente', // Estado inicial para poder cambiar a Pagada
        next_send_date: colombiaDateString.split('T')[0], // Fecha de envío para mostrar en la tabla
        created_at: colombiaDateString // Marca temporal del envío
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creando registro histórico:', error);
      throw new Error(`Error creando registro histórico: ${error.message}`);
    }

    console.log(`📋 Registro histórico creado con ID: ${data.id}`);
    return data.id;
  }

  // Método para crear un registro histórico retroactivo con fecha específica
  async createRetroactiveHistoryRecord(
    originalInvoice: ScheduledInvoice, 
    specificDate: string // formato 'YYYY-MM-DD'
  ): Promise<string> {
    // Convertir la fecha específica a ISO string en zona horaria de Colombia
    const specificDateTime = new Date(specificDate + 'T12:00:00-05:00'); // Mediodía Colombia
    const colombiaDateString = specificDateTime.toISOString();
    
    const { data, error } = await supabase
      .from('scheduled_invoices')
      .insert({
        email: originalInvoice.email,
        amount: originalInvoice.amount,
        frequency: originalInvoice.frequency,
        due_date_day: originalInvoice.due_date_day,
        concept: originalInvoice.concept,
        is_active: false, // No es activa porque es un registro histórico
        last_sent: colombiaDateString, // Se marca como enviada en la fecha específica
        status: 'Pendiente', // Estado inicial para poder cambiar a Pagada
        next_send_date: specificDate, // Fecha específica para mostrar en la tabla
        created_at: colombiaDateString // Marca temporal del envío específico
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creando registro histórico retroactivo:', error);
      throw new Error(`Error creando registro histórico retroactivo: ${error.message}`);
    }

    console.log(`📋 Registro histórico retroactivo creado con ID: ${data.id} para fecha: ${specificDate}`);
    return data.id;
  }

  async logEmailSent(scheduledInvoiceId: string, email: string, status: 'success' | 'failed', errorMessage?: string): Promise<void> {
    const { error } = await supabase
      .from('email_logs')
      .insert({
        scheduled_invoice_id: scheduledInvoiceId,
        email: email,
        status: status,
        error_message: errorMessage || null
      });

    if (error) {
      console.error('Error registrando log de email:', error);
      // No lanzamos error aquí porque el log es secundario
    }
  }

  private calculateNextSendDate(frequency: 'monthly' | 'biweekly', dueDateDay: number): string {
    // Usar zona horaria de Colombia (UTC-5)
    const currentDate = new Date();
    const colombiaDate = new Date(currentDate.toLocaleString("en-US", {timeZone: "America/Bogota"}));
    const now = colombiaDate;
    const nextDate = new Date(colombiaDate);

    if (frequency === 'monthly') {
      // Para mensual, ir al próximo mes en el día especificado
      nextDate.setMonth(now.getMonth() + 1);
      nextDate.setDate(dueDateDay);
      
      // Si el día especificado no existe en el próximo mes, ir al último día del mes
      if (nextDate.getDate() !== dueDateDay) {
        nextDate.setDate(0); // Último día del mes anterior
      }
    } else {
      // Para quincenal
      if (dueDateDay === 1) {
        // Primera quincena del próximo mes
        nextDate.setMonth(now.getMonth() + 1);
        nextDate.setDate(1);
      } else {
        // Segunda quincena (día 16) del próximo mes
        nextDate.setMonth(now.getMonth() + 1);
        nextDate.setDate(16);
      }
    }

    // Si la fecha calculada ya pasó este mes, pasar al siguiente período
    if (nextDate <= now) {
      if (frequency === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else {
        // Para quincenal, si estamos en la primera quincena, ir a la segunda
        // Si estamos en la segunda, ir al primer día del próximo mes
        if (dueDateDay === 1) {
          nextDate.setDate(16);
        } else {
          nextDate.setMonth(nextDate.getMonth() + 1);
          nextDate.setDate(1);
        }
      }
    }

    const result = nextDate.toISOString().split('T')[0];
    console.log(`📅 [Colombia UTC-5] Próxima fecha calculada: ${result}`);
    return result;
  }

  async deactivateScheduledInvoice(id: string): Promise<void> {
    const { error } = await supabase
      .from('scheduled_invoices')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error desactivando factura:', error);
      throw new Error(`Error desactivando factura: ${error.message}`);
    }
  }

  async updateInvoiceStatus(id: string, status: 'Pendiente' | 'Pagada' | 'Programada'): Promise<void> {
    const { error } = await supabase
      .from('scheduled_invoices')
      .update({ status: status })
      .eq('id', id);

    if (error) {
      console.error('Error actualizando estado de factura:', error);
      throw new Error(`Error actualizando estado: ${error.message}`);
    }
  }

  // Método para eliminar una factura (usado cuando falla el envío de un registro histórico)
  async deleteInvoice(id: string): Promise<void> {
    const { error } = await supabase
      .from('scheduled_invoices')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando factura:', error);
      throw new Error(`Error eliminando factura: ${error.message}`);
    }

    console.log(`🗑️ Factura eliminada: ${id}`);
  }

  async close(): Promise<void> {
    // Supabase maneja las conexiones automáticamente
    console.log('Conexión Supabase cerrada');
  }
}

export const dbManager = new SupabaseDatabaseManager(); 