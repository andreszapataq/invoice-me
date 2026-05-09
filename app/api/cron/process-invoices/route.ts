import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDatabaseManager } from '@/lib/database';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { emailService } from '@/lib/email-service';

export async function GET(request: NextRequest) {
  try {
    // Verificar que sea una llamada de cron job de Vercel
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // El cron usa service role para bypassar RLS (no hay sesión de usuario)
    const dbManager = new SupabaseDatabaseManager(supabaseAdmin);

    console.log('🚀 [CRON] Iniciando procesamiento de facturas programadas...');
    
    // Obtener facturas que deben enviarse hoy
    const invoicesDue = await dbManager.getInvoicesDueToday();
    
    if (invoicesDue.length === 0) {
      console.log('📋 [CRON] No hay facturas programadas para hoy');
      return NextResponse.json({
        success: true,
        message: 'No hay facturas programadas para procesar',
        processed: 0
      });
    }

    console.log(`📧 [CRON] ${invoicesDue.length} factura(s) programada(s) para envío hoy`);

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    // Procesar cada factura
    for (const invoice of invoicesDue) {
      try {
        console.log(`📤 [CRON] Procesando factura: ${invoice.concept} para ${invoice.email}`);
        
        // PASO 1: Crear registro histórico antes del envío
        const historyRecordId = await dbManager.createInvoiceHistoryRecord(invoice);
        console.log(`📋 [CRON] Registro histórico creado: ${historyRecordId}`);
        
        // PASO 2: Enviar el correo
        const result = await emailService.sendInvoiceEmail(invoice);
        
        if (result.success) {
          // PASO 3: Actualizar la factura programada original para próximo envío
          await dbManager.updateLastSent(invoice.id);
          await dbManager.logEmailSent(invoice.id, invoice.email, 'success');
          
          console.log(`✅ [CRON] Factura enviada exitosamente a ${invoice.email}`);
          console.log(`📅 [CRON] Próximo envío programado para la factura original`);
          console.log(`📋 [CRON] Registro histórico disponible para seguimiento de pago`);
          successCount++;
          results.push({
            id: invoice.id,
            email: invoice.email,
            concept: invoice.concept,
            status: 'success',
            historyRecordId: historyRecordId
          });
        } else {
          // Si falla el envío, eliminar el registro histórico
          console.log(`❌ [CRON] Error enviando factura, eliminando registro histórico...`);
          await dbManager.deleteInvoice(historyRecordId);
          
          // Registrar el error en la factura original
          await dbManager.logEmailSent(invoice.id, invoice.email, 'failed', result.error);
          console.error(`❌ [CRON] Error enviando factura a ${invoice.email}: ${result.error}`);
          errorCount++;
          results.push({
            id: invoice.id,
            email: invoice.email,
            concept: invoice.concept,
            status: 'error',
            error: result.error
          });
        }
        
        // Esperar un poco entre envíos para no sobrecargar el servicio de correo
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ [CRON] Error procesando factura ${invoice.id}:`, error);
        
        // Registrar el error
        await dbManager.logEmailSent(
          invoice.id, 
          invoice.email, 
          'failed', 
          error instanceof Error ? error.message : 'Error desconocido'
        );
        
        errorCount++;
        results.push({
          id: invoice.id,
          email: invoice.email,
          concept: invoice.concept,
          status: 'error',
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }
    
    console.log(`✅ [CRON] Procesamiento completado. Éxitos: ${successCount}, Errores: ${errorCount}`);
    
    return NextResponse.json({
      success: true,
      message: `Procesamiento completado`,
      processed: invoicesDue.length,
      successful: successCount,
      errors: errorCount,
      results
    });

  } catch (error) {
    console.error('❌ [CRON] Error general en procesamiento:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// También permitir POST por si acaso
export async function POST(request: NextRequest) {
  return GET(request);
} 