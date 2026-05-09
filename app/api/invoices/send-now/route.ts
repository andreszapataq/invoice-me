import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';
import { SupabaseDatabaseManager } from '@/lib/database';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ScheduledInvoice } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const dbManager = new SupabaseDatabaseManager(supabase);

    const body = await request.json();
    
    // Validar datos requeridos
    const { email, amount, frequency, dueDateDay, concept } = body;
    
    if (!email || !amount || !frequency || !dueDateDay || !concept) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Validar monto
    const numericAmount = parseInt(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser un número mayor a 0' },
        { status: 400 }
      );
    }

    // Validar frecuencia
    if (!['monthly', 'biweekly'].includes(frequency)) {
      return NextResponse.json(
        { error: 'Frecuencia debe ser "monthly" o "biweekly"' },
        { status: 400 }
      );
    }

    console.log(`⚡ Enviando factura inmediata a ${email}`);
    console.log(`💰 Concepto: ${concept}, Monto: $${numericAmount.toLocaleString('es-CO')}`);

    // PASO 1: Guardar la factura en la base de datos como historial
    // Para envío inmediato, marcamos como inactiva para que no se procese automáticamente
    const invoiceId = await dbManager.createScheduledInvoice({
      email,
      amount: numericAmount,
      frequency: frequency as 'monthly' | 'biweekly',
      due_date_day: parseInt(dueDateDay),
      concept,
      is_active: false, // Inactiva porque ya se envió inmediatamente
      last_sent: null, // Aún no se ha enviado, se actualizará después
      status: 'Pendiente' // Estado inicial para facturas enviadas inmediatamente
    });

    console.log(`💾 Factura guardada en DB con ID: ${invoiceId}`);

    // PASO 2: Crear objeto temporal para envío inmediato
    // Usar zona horaria de Colombia (UTC-5)
    const currentDate = new Date();
    const colombiaDate = new Date(currentDate.toLocaleString("en-US", {timeZone: "America/Bogota"}));
    const currentDateString = colombiaDate.toISOString();
    const currentDateOnly = colombiaDate.toISOString().split('T')[0];
    
    const temporaryInvoice: ScheduledInvoice = {
      id: invoiceId, // Usar el ID real de la base de datos
      email,
      amount: numericAmount,
      frequency: frequency as 'monthly' | 'biweekly',
      due_date_day: parseInt(dueDateDay),
      concept,
      is_active: false, // Inactiva porque ya se envió
      created_at: currentDateString,
      next_send_date: currentDateOnly,
      last_sent: null,
      status: 'Pendiente' // Agregamos el campo status requerido
    };

    console.log(`📅 Fecha de envío: ${currentDateOnly} (Colombia UTC-5, ignorando día de corte: ${dueDateDay})`);

    // PASO 3: Enviar correo inmediatamente
    const emailResult = await emailService.sendInvoiceEmail(temporaryInvoice);

    if (emailResult.success) {
      // PASO 4a: Marcar como enviada actualizando last_sent
      try {
        await dbManager.updateLastSent(invoiceId);
        console.log(`📧 Registro actualizado: última fecha de envío establecida`);
      } catch (updateError) {
        console.error(`⚠️ Advertencia: Error actualizando last_sent:`, updateError);
        // No fallamos la operación por esto, el correo ya se envió
      }

      // PASO 4b: Registrar en email_logs
      try {
        await dbManager.logEmailSent(invoiceId, email, 'success');
        console.log(`📋 Registro en email_logs creado exitosamente`);
      } catch (logError) {
        console.error(`⚠️ Advertencia: Error registrando en email_logs:`, logError);
        // No fallamos la operación por esto, el correo ya se envió
      }

      console.log(`✅ Factura enviada exitosamente a ${email} y guardada en historial`);
      return NextResponse.json({
        success: true,
        message: 'Factura enviada exitosamente por correo y guardada en historial',
        invoiceId,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error(`❌ Error enviando factura a ${email}: ${emailResult.error}`);
      
      // PASO 4c: Registrar error en email_logs
      try {
        await dbManager.logEmailSent(invoiceId, email, 'failed', emailResult.error);
        console.log(`📋 Error registrado en email_logs`);
      } catch (logError) {
        console.error(`⚠️ Error registrando fallo en email_logs:`, logError);
      }
      
      // Si falla el envío, podríamos opcionalmente eliminar el registro o marcarlo como fallido
      // Por ahora lo dejamos en la DB como historial del intento
      
      return NextResponse.json(
        { error: emailResult.error || 'Error enviando la factura por correo' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error en envío inmediato de factura:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 