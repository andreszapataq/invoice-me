import { Resend } from 'resend';
import { generateInvoicePDF } from './pdf-generator';
import { Invoice } from '@/lib/data';
import { ScheduledInvoice } from './supabase';

// Configuración del servicio Resend
class EmailService {
  private resend: Resend;
  private isDevelopment: boolean;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    
    // Si no hay API key, usar modo simulación
    if (!apiKey) {
      console.log('⚠️ RESEND_API_KEY no configurada. Los correos se simularán.');
      this.resend = new Resend('test_key');
    } else {
      console.log('✅ RESEND_API_KEY configurada. Los correos se enviarán realmente.');
      this.resend = new Resend(apiKey);
    }
  }

  async sendInvoiceEmail(scheduledInvoice: ScheduledInvoice): Promise<{ success: boolean; error?: string }> {
    try {
      // Convertir ScheduledInvoice a Invoice para el generador de PDF
      // Para "Enviar Ahora" siempre usar la fecha actual, para programados usar la fecha de envío
      const currentDate = new Date();
      const currentDateString = currentDate.toISOString().slice(0, 10);
      
      const invoice: Invoice = {
        id: scheduledInvoice.id,
        status: "En Proceso",
        email: scheduledInvoice.email,
        amount: scheduledInvoice.amount,
        frequency: scheduledInvoice.frequency as 'monthly' | 'biweekly',
        concept: scheduledInvoice.concept,
        // Si es un envío temporal (id empieza con 'temp-'), usar fecha actual
        // Si es programado, usar la fecha actual también para asegurar consistencia
        date: currentDateString
      };

      console.log(`📅 Generando PDF con fecha: ${currentDateString}`);

      // Generar el PDF de la factura
      const pdfData = await generateInvoicePDF(invoice, {
        name: "Hernan Andres",
        fullName: "Hernan Andres Zapata Quiñonez",
        address: "KR 97 # 6 25 Casa blanca",
        id: "94541677"
      });

      // Si no hay API key de Resend, solo simular
      if (!process.env.RESEND_API_KEY) {
        console.log(`📧 [SIMULADO] Enviando factura a ${scheduledInvoice.email}`);
        console.log(`💰 Concepto: ${scheduledInvoice.concept}`);
        console.log(`💵 Monto: $${scheduledInvoice.amount.toLocaleString('es-CO')}`);
        console.log(`📅 Frecuencia: ${scheduledInvoice.frequency === 'monthly' ? 'Mensual' : 'Quincenal'}`);
        console.log(`📄 PDF generado exitosamente`);
        console.log(`⚠️ Para enviar correos reales, configura RESEND_API_KEY en tu archivo .env`);
        
        // Simular tiempo de procesamiento
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
      }

      // Envío real con Resend
      console.log(`📧 [REAL] Enviando factura a ${scheduledInvoice.email} usando Resend...`);
      
      const emailHTML = this.generateEmailHTML(scheduledInvoice);
      const pdfBuffer = this.base64ToBuffer(pdfData);

      const { data, error } = await this.resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: [scheduledInvoice.email],
        subject: `Factura ${scheduledInvoice.concept} - ${new Date().toLocaleDateString('es-CO')}`,
        html: emailHTML,
        attachments: [
          {
            filename: `factura-${scheduledInvoice.id}.pdf`,
            content: pdfBuffer
          }
        ]
      });

      if (error) {
        console.error('❌ Error enviando con Resend:', error);
        return { 
          success: false, 
          error: error.message || 'Error enviando correo'
        };
      }

      console.log(`✅ Correo enviado exitosamente. ID: ${data?.id}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Error en servicio de correo:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  private base64ToBuffer(base64Data: string): Buffer {
    // Remover el prefijo data:application/pdf;base64, si existe
    const base64String = base64Data.includes(',') 
      ? base64Data.split(',')[1] 
      : base64Data;
    
    return Buffer.from(base64String, 'base64');
  }

  private generateEmailHTML(scheduledInvoice: ScheduledInvoice): string {
    const formattedAmount = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(scheduledInvoice.amount);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Factura - ${scheduledInvoice.concept}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f6f9fc;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #FF6633 0%, #FF8E53 100%);
            color: white;
            padding: 40px 30px;
            text-align: center; 
          }
          .logo { 
            font-size: 32px; 
            font-weight: bold; 
            margin-bottom: 10px;
          }
          .content {
            padding: 40px 30px;
          }
          .invoice-details { 
            background: #f8f9fa; 
            padding: 25px; 
            border-radius: 8px; 
            margin: 25px 0; 
            border-left: 4px solid #FF6633;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
          }
          .detail-label {
            font-weight: 600;
            color: #495057;
          }
          .detail-value {
            color: #212529;
          }
          .amount { 
            font-size: 24px; 
            font-weight: bold; 
            color: #FF6633; 
          }
          .footer { 
            background: #f8f9fa;
            padding: 30px;
            text-align: center; 
            font-size: 14px; 
            color: #6c757d; 
            border-top: 1px solid #dee2e6;
          }
          .highlight-box {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
          }
          .brand-mark {
            color: #FF6633;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Invoice Me</div>
            <p style="margin: 0; opacity: 0.9;">Tu factura automática está lista</p>
          </div>
          
          <div class="content">
            <h2 style="color: #212529; margin-top: 0;">¡Hola! Tu factura ha sido generada</h2>
            
            <p>Te enviamos tu factura correspondiente al período actual. Encuentra todos los detalles a continuación:</p>
            
            <div class="invoice-details">
              <h3 style="margin-top: 0; color: #495057;">Detalles de la Factura</h3>
              
              <div class="detail-row">
                <span class="detail-label">Concepto:</span>
                <span class="detail-value">${scheduledInvoice.concept}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Monto:</span>
                <span class="detail-value amount">${formattedAmount}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Fecha de emisión:</span>
                <span class="detail-value">${new Date().toLocaleDateString('es-CO', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Frecuencia:</span>
                <span class="detail-value">${scheduledInvoice.frequency === 'monthly' ? 'Mensual' : 'Quincenal'}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">ID de Factura:</span>
                <span class="detail-value">${scheduledInvoice.id}</span>
              </div>
            </div>
            
            <div class="highlight-box">
              <p style="margin: 0;"><strong>📎 Archivo adjunto:</strong> Encuentra tu factura en formato PDF adjunta a este correo.</p>
            </div>
            
            <p>Si tienes alguna pregunta sobre esta factura, no dudes en contactarnos.</p>
          </div>
          
          <div class="footer">
            <p style="margin: 0 0 10px 0;">Este es un correo automático generado por <span class="brand-mark">Invoice Me</span></p>
            <p style="margin: 0; font-size: 12px;">Si no esperabas este correo, por favor contáctanos.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (this.isDevelopment) {
        console.log('✅ Modo desarrollo - Resend no será usado para pruebas');
        return true;
      }

      // Test real de conexión con Resend
      const { error } = await this.resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: ['test@example.com'],
        subject: 'Test de conexión Invoice Me',
        html: '<p>Test de conexión exitoso</p>',
      });

      if (error) {
        console.error('❌ Error en test de Resend:', error);
        return false;
      }

      console.log('✅ Conexión con Resend exitosa');
      return true;
    } catch (error) {
      console.error('❌ Error en test de conexión:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
