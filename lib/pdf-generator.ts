import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
import { Invoice } from './data';

// Interfaz para la información del cliente
interface CustomerInfo {
  name?: string;
  fullName?: string;
  address?: string;
  id?: string;
}

// Función para generar un PDF a partir de los datos de la factura
export async function generateInvoicePDF(invoice: Invoice, customerInfo: CustomerInfo = {}): Promise<string> {
  // Crear un nuevo documento PDF
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Configuración de fuentes y colores
  const primaryColor = '#FF6633'; // Color naranja para Invoice Me
  const textColor = '#333333';
  
  // Título - Invoice Me
  doc.setFontSize(32);
  doc.setTextColor(primaryColor);
  doc.text('Invoice', 15, 25);
  doc.text('Me', 15, 40);
  
  // Número de factura y fecha
  doc.setFontSize(12);
  doc.setTextColor(textColor);
  doc.text(`No. ${invoice.id.substring(4, 8).padStart(4, '0')}`, pageWidth - 15, 25, { align: 'right' });
  
  // Formatear la fecha
  const date = new Date(invoice.date);
  const formattedDate = `${date.getDate()} ${getMonthName(date).toLowerCase()} ${date.getFullYear()}`;
  doc.text(formattedDate, pageWidth - 15, 35, { align: 'right' });
  
  // Datos del cliente
  doc.setFontSize(12);
  doc.text('Datos del Cliente', 15, 60);
  doc.setFontSize(10);
  doc.text(customerInfo.fullName || 'Cliente', 15, 70);
  doc.text(`C.C. ${customerInfo.id || ''}`, 15, 77);
  
  // Si hay dirección, la agregamos
  if (customerInfo.address) {
    const addressParts = customerInfo.address.split(' ');
    // Primera línea: CR 97 6 25
    // Segunda línea: resto de la dirección
    if (addressParts.length >= 4) {
      doc.text(`${addressParts.slice(0, 4).join(' ')}`, 15, 84);
      if (addressParts.length > 4) {
        doc.text(`${addressParts.slice(4).join(' ')}`, 15, 91);
      }
    } else {
      doc.text(customerInfo.address, 15, 84);
    }
  }
  
  const city = "Cali, Colombia";
  doc.text(city, 15, 98);
  
  // Tabla de items
  const tableY = 110;
  const colWidths = [0.4, 0.2, 0.2, 0.2]; // Proporciones para cada columna
  
  // Encabezados de tabla
  doc.setFillColor(240, 240, 240);
  doc.rect(15, tableY, pageWidth - 30, 8, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(textColor);
  
  const tableStartX = 15;
  let currentX = tableStartX;
  
  // Encabezados
  doc.text('Item', currentX + 5, tableY + 6);
  currentX += (pageWidth - 30) * colWidths[0];
  
  doc.text('Valor', currentX, tableY + 6);
  currentX += (pageWidth - 30) * colWidths[1];
  
  doc.text('Cantidad', currentX, tableY + 6);
  currentX += (pageWidth - 30) * colWidths[2];
  
  doc.text('Total', currentX, tableY + 6);
  
  // Contenido de la tabla
  const contentY = tableY + 20;
  
  // ID y concepto del item
  doc.text(`${invoice.id.substring(4, 8).padStart(4, '0')} ${invoice.concept || 'Saving Plan for You'}`, tableStartX + 5, contentY);
  
  // Valor unitario
  const formattedAmount = formatCurrency(invoice.amount);
  currentX = tableStartX + (pageWidth - 30) * colWidths[0];
  doc.text(formattedAmount, currentX, contentY);
  
  // Cantidad
  currentX += (pageWidth - 30) * colWidths[1];
  doc.text('1', currentX, contentY);
  
  // Total
  currentX += (pageWidth - 30) * colWidths[2];
  doc.text(formattedAmount, currentX, contentY);
  
  // Línea separadora
  const lineY = contentY + 90;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(15, lineY, pageWidth - 15, lineY);
  
  // Información bancaria
  const bankInfoY = lineY + 20;
  doc.setFontSize(12);
  doc.text('Cuenta Bancaria', 15, bankInfoY);
  
  doc.setFontSize(10);
  doc.text('Nequi Colombia', 15, bankInfoY + 10);
  doc.text('No. 3113559747', 15, bankInfoY + 17);
  doc.text('Andres Zapata', 15, bankInfoY + 24);
  
  // Total final
  doc.setFontSize(14);
  doc.text('Total', pageWidth - 80, bankInfoY + 15);
  
  doc.setFontSize(14);
  doc.setTextColor(textColor);
  doc.text(formattedAmount, pageWidth - 15, bankInfoY + 15, { align: 'right' });
  
  // Botón de paga aquí
  doc.setFontSize(14);
  doc.setTextColor(primaryColor);
  doc.text('Paga aquí', 15, bankInfoY + 45);
  
  // Dibujar un cursor de mano junto al texto
  const cursorY = bankInfoY + 45 - 3;
  doc.setTextColor(textColor);
  doc.text('↘', 80, cursorY);
  
  // Pie de página
  doc.setFontSize(10);
  doc.setTextColor(textColor);
  doc.text('Invoice Me ®', pageWidth / 2, 280, { align: 'center' });
  
  // Retornar el documento como string base64
  const pdfBase64 = doc.output('datauristring');
  return pdfBase64;
}

// Función auxiliar para obtener el nombre del mes
function getMonthName(date: Date): string {
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return monthNames[date.getMonth()];
}

// Función auxiliar para formatear moneda
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
} 