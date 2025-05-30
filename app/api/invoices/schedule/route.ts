import { NextRequest, NextResponse } from 'next/server';
import { dbManager } from '@/lib/database';

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

    // Validar día de corte
    const numericDay = parseInt(dueDateDay);
    if (frequency === 'monthly' && (numericDay < 1 || numericDay > 31)) {
      return NextResponse.json(
        { error: 'Para mensual, el día debe estar entre 1 y 31' },
        { status: 400 }
      );
    }
    if (frequency === 'biweekly' && ![1, 16].includes(numericDay)) {
      return NextResponse.json(
        { error: 'Para quincenal, el día debe ser 1 o 16' },
        { status: 400 }
      );
    }

    // Crear la factura programada
    const invoiceId = await dbManager.createScheduledInvoice({
      email,
      amount: numericAmount,
      frequency,
      due_date_day: numericDay,
      concept,
      is_active: true
    });

    return NextResponse.json({
      success: true,
      invoiceId,
      message: 'Factura programada exitosamente'
    });

  } catch (error) {
    console.error('Error programando factura:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const activeInvoices = await dbManager.getActiveScheduledInvoices();
    
    return NextResponse.json({
      success: true,
      invoices: activeInvoices
    });

  } catch (error) {
    console.error('Error obteniendo facturas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 