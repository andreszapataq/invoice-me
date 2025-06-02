import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';
import { ScheduledInvoice } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
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

    // Crear objeto temporal de factura para envío inmediato (NO se guarda en DB)
    // IMPORTANTE: Para "Enviar Ahora" siempre usar la fecha actual, ignorar día de corte
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString();
    const currentDateOnly = currentDate.toISOString().split('T')[0];
    
    const temporaryInvoice: ScheduledInvoice = {
      id: `temp-${Date.now()}`, // ID temporal único
      email,
      amount: numericAmount,
      frequency: frequency as 'monthly' | 'biweekly',
      due_date_day: parseInt(dueDateDay), // Se mantiene para referencia pero no afecta la fecha
      concept,
      is_active: true,
      created_at: currentDateString,
      next_send_date: currentDateOnly, // Siempre hoy para envío inmediato
      last_sent: null
    };

    console.log(`⚡ Enviando factura inmediata a ${email}`);
    console.log(`💰 Concepto: ${concept}, Monto: $${numericAmount.toLocaleString('es-CO')}`);
    console.log(`📅 Fecha de envío: ${currentDateOnly} (ignorando día de corte: ${dueDateDay})`);

    // Enviar correo inmediatamente usando el servicio de email
    const emailResult = await emailService.sendInvoiceEmail(temporaryInvoice);

    if (emailResult.success) {
      console.log(`✅ Factura enviada exitosamente a ${email}`);
      return NextResponse.json({
        success: true,
        message: 'Factura enviada exitosamente por correo',
        timestamp: new Date().toISOString()
      });
    } else {
      console.error(`❌ Error enviando factura a ${email}: ${emailResult.error}`);
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