import { generateInvoicePDF } from './pdf-generator';
import { Invoice } from '@/lib/data';
import { ScheduledInvoice } from './database';

// Interfaz para la configuración del servicio de correo
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Simulación del servicio de correo para desarrollo
// En producción, usarías nodemailer con configuración real
class EmailService {
  private config: EmailConfig | null = null;

  constructor() {
    // En desarrollo, usamos configuración simulada
    this.config = {
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'demo@example.com',
        pass: process.env.EMAIL_PASS || 'demo-password'
      }
    };
  }

  async sendInvoiceEmail(scheduledInvoice: ScheduledInvoice): Promise<{ success: boolean; error?: string }> {
    try {
      // Convertir ScheduledInvoice a Invoice para el generador de PDF
      const invoice: Invoice = {
        id: scheduledInvoice.id,
        status: "En Proceso",
        email: scheduledInvoice.email,
        amount: scheduledInvoice.amount,
        frequency: scheduledInvoice.frequency,
        concept: scheduledInvoice.concept,
        date: new Date().toISOString().slice(0, 10)
      };

      // Generar el PDF de la factura
      const pdfData = await generateInvoicePDF(invoice, {
        name: "Hernan Andres",
        fullName: "Hernan Andres Zapata Quiñonez",
        address: "KR 97 # 6 25 Casa blanca",
        id: "94541677"
      });

      // En desarrollo, solo simulamos el envío
      console.log(`📧 [SIMULADO] Enviando factura a ${scheduledInvoice.email}`);
      console.log(`💰 Concepto: ${scheduledInvoice.concept}`);
      console.log(`💵 Monto: $${scheduledInvoice.amount.toLocaleString('es-CO')}`);
      console.log(`📅 Frecuencia: ${scheduledInvoice.frequency === 'monthly' ? 'Mensual' : 'Quincenal'}`);
      console.log(`📄 PDF generado exitosamente - Tamaño: ${pdfData.length} caracteres`);

      // Simular tiempo de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));

      // En producción, aquí usarías nodemailer:
      /*
      const transporter = nodemailer.createTransporter(this.config);
      
      const mailOptions = {
        from: `"Invoice Me" <${this.config.auth.user}>`,
        to: scheduledInvoice.email,
        subject: `Factura ${scheduledInvoice.concept} - ${new Date().toLocaleDateString('es-CO')}`,
        html: this.generateEmailHTML(scheduledInvoice),
        attachments: [{
          filename: `factura-${scheduledInvoice.id}.pdf`,
          content: pdfData.split(',')[1], // Remover el prefijo data:application/pdf;base64,
          encoding: 'base64'
        }]
      };

      await transporter.sendMail(mailOptions);
      */

      return { success: true };
    } catch (error) {
      console.error('Error enviando correo:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
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
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #FF6633; font-size: 32px; font-weight: bold; }
          .invoice-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #FF6633; }
          .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Invoice Me</div>
            <p>Tu factura automática está lista</p>
          </div>
          
          <div class="invoice-details">
            <h3>Detalles de la Factura</h3>
            <p><strong>Concepto:</strong> ${scheduledInvoice.concept}</p>
            <p><strong>Monto:</strong> <span class="amount">${formattedAmount}</span></p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-CO')}</p>
            <p><strong>Frecuencia:</strong> ${scheduledInvoice.frequency === 'monthly' ? 'Mensual' : 'Quincenal'}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p>Encuentra tu factura en PDF adjunta a este correo.</p>
          </div>
          
          <div class="footer">
            <p>Este es un correo automático de Invoice Me</p>
            <p>Si no esperabas este correo, por favor contáctanos.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async testConnection(): Promise<boolean> {
    try {
      // En desarrollo, siempre retornamos true
      console.log('✅ Conexión de correo simulada exitosa');
      return true;
    } catch (error) {
      console.error('❌ Error en conexión de correo:', error);
      return false;
    }
  }
}

export const emailService = new EmailService(); 