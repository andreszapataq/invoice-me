import { dbManager } from './database';
import { emailService } from './email-service';

class SchedulerService {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  // Iniciar el scheduler (simula cron job)
  start(): void {
    if (this.isRunning) {
      console.log('⚠️ Scheduler ya está ejecutándose');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Iniciando scheduler de facturas...');

    // Verificar facturas pendientes cada hora (en producción sería cada día)
    const mainInterval = setInterval(() => {
      this.processScheduledInvoices().catch(error => {
        console.error('Error procesando facturas programadas:', error);
      });
    }, 60000); // 1 minuto para desarrollo, cambiar a 24 horas en producción

    this.intervals.set('main', mainInterval);

    // Ejecutar inmediatamente una vez al iniciar
    this.processScheduledInvoices().catch(error => {
      console.error('Error en ejecución inicial:', error);
    });
  }

  // Detener el scheduler
  stop(): void {
    if (!this.isRunning) {
      console.log('⚠️ Scheduler no está ejecutándose');
      return;
    }

    console.log('🛑 Deteniendo scheduler de facturas...');
    
    // Limpiar todos los intervalos
    this.intervals.forEach((interval, key) => {
      clearInterval(interval);
      console.log(`   Intervalo ${key} detenido`);
    });
    
    this.intervals.clear();
    this.isRunning = false;
    console.log('✅ Scheduler detenido completamente');
  }

  // Procesar facturas que deben enviarse hoy
  private async processScheduledInvoices(): Promise<void> {
    try {
      console.log('🔍 Verificando facturas programadas para hoy...');
      
      const invoicesDue = await dbManager.getInvoicesDueToday();
      
      if (invoicesDue.length === 0) {
        console.log('📋 No hay facturas programadas para hoy');
        return;
      }

      console.log(`📧 ${invoicesDue.length} factura(s) programada(s) para envío hoy`);

      // Procesar cada factura
      for (const invoice of invoicesDue) {
        try {
          console.log(`📤 Procesando factura: ${invoice.concept} para ${invoice.email}`);
          
          // PASO 1: Crear registro histórico antes del envío
          const historyRecordId = await dbManager.createInvoiceHistoryRecord(invoice);
          console.log(`📋 Registro histórico creado: ${historyRecordId}`);
          
          // PASO 2: Enviar el correo
          const result = await emailService.sendInvoiceEmail(invoice);
          
          if (result.success) {
            // PASO 3: Actualizar la factura programada original para próximo envío
            await dbManager.updateLastSent(invoice.id);
            await dbManager.logEmailSent(invoice.id, invoice.email, 'success');
            
            console.log(`✅ Factura enviada exitosamente a ${invoice.email}`);
            console.log(`📅 Próximo envío programado para la factura original`);
            console.log(`📋 Registro histórico disponible para seguimiento de pago`);
          } else {
            // Si falla el envío, eliminar el registro histórico
            console.log(`❌ Error enviando factura, eliminando registro histórico...`);
            await dbManager.deleteInvoice(historyRecordId);
            
            // Registrar el error en la factura original
            await dbManager.logEmailSent(invoice.id, invoice.email, 'failed', result.error);
            console.error(`❌ Error enviando factura a ${invoice.email}: ${result.error}`);
          }
          
          // Esperar un poco entre envíos para no sobrecargar
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`❌ Error procesando factura ${invoice.id}:`, error);
          
          // Registrar el error
          await dbManager.logEmailSent(
            invoice.id, 
            invoice.email, 
            'failed', 
            error instanceof Error ? error.message : 'Error desconocido'
          );
        }
      }
      
      console.log('✅ Procesamiento de facturas completado');
      
    } catch (error) {
      console.error('❌ Error general en processScheduledInvoices:', error);
    }
  }

  // Método para forzar el procesamiento manual (útil para testing)
  async forceProcess(): Promise<void> {
    console.log('🔧 Forzando procesamiento manual de facturas...');
    await this.processScheduledInvoices();
  }

  // Obtener el estado del scheduler
  getStatus(): { isRunning: boolean; activeIntervals: number } {
    return {
      isRunning: this.isRunning,
      activeIntervals: this.intervals.size
    };
  }

  // Programar una factura para envío inmediato (para testing)
  async scheduleImmediateInvoice(invoiceData: {
    email: string;
    amount: number;
    frequency: 'monthly' | 'biweekly';
    due_date_day: number;
    concept: string;
  }): Promise<string> {
    try {
      console.log('⚡ Programando factura para envío inmediato...');
      
      // Crear la factura programada
      const invoiceId = await dbManager.createScheduledInvoice({
        ...invoiceData,
        is_active: true,
        last_sent: null,
        status: 'Programada'
      });
      
      // Forzar el procesamiento
      await this.forceProcess();
      
      return invoiceId;
    } catch (error) {
      console.error('❌ Error programando factura inmediata:', error);
      throw error;
    }
  }
}

export const scheduler = new SchedulerService();

// Solo inicializar el scheduler automáticamente en desarrollo local
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  // Esperar un poco antes de iniciar para que todo esté configurado
  setTimeout(() => {
    console.log('🔧 Iniciando scheduler local para desarrollo...');
    scheduler.start();
  }, 5000);
} else if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  console.log('🚀 En producción - usando Vercel Cron Jobs en lugar del scheduler local');
} 