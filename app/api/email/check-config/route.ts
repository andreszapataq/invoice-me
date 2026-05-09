import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const configured = !!process.env.RESEND_API_KEY;
    
    return NextResponse.json({
      configured,
      message: configured 
        ? 'Email configurado correctamente' 
        : 'Email en modo simulación - configura RESEND_API_KEY para envíos reales'
    });
  } catch (error) {
    console.error('Error verificando configuración de email:', error);
    return NextResponse.json(
      { configured: false, error: 'Error verificando configuración' },
      { status: 500 }
    );
  }
} 