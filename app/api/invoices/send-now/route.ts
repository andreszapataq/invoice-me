import { NextRequest, NextResponse } from 'next/server';
import { scheduler } from '@/lib/scheduler';

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

    // Programar la factura para envío inmediato
    const invoiceId = await scheduler.scheduleImmediateInvoice({
      email,
      amount: parseInt(amount),
      frequency,
      due_date_day: parseInt(dueDateDay),
      concept
    });

    return NextResponse.json({
      success: true,
      invoiceId,
      message: 'Factura enviada exitosamente por correo'
    });

  } catch (error) {
    console.error('Error enviando factura:', error);
    return NextResponse.json(
      { error: 'Error enviando la factura' },
      { status: 500 }
    );
  }
} 