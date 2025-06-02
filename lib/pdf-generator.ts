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
  const primaryColor = '#FF6633'; // Color naranjo para Invoice Me
  const textColor = '#333333';
  
  // Título - Invoice Me con líneas más juntas y más bold
  doc.setFontSize(36); // Aumenté el tamaño para hacerlo más bold
  doc.setTextColor(primaryColor);
  doc.text('Invoice', 15, 25);
  doc.text('Me', 15, 37); // Reduje el espacio entre las líneas
  
  // Solo fecha (eliminamos el consecutivo)
  doc.setFontSize(12);
  doc.setTextColor(textColor);
  
  // Formatear la fecha - asegurar que use la fecha correcta sin problemas de zona horaria
  let date: Date;
  if (invoice.date.includes('T')) {
    // Si viene con tiempo, usar solo la parte de fecha
    const dateParts = invoice.date.split('T')[0].split('-');
    date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
  } else {
    // Si es solo fecha, parsear directamente
    const dateParts = invoice.date.split('-');
    date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
  }
  
  const formattedDate = `${date.getDate()} ${getMonthName(date).toLowerCase()} ${date.getFullYear()}`;
  console.log(`📄 PDF generando con fecha: ${invoice.date} -> ${formattedDate}`);
  doc.text(formattedDate, pageWidth - 15, 25, { align: 'right' }); // Ajusté la posición Y
  
  // Datos del cliente
  doc.setFontSize(12);
  doc.text('Datos del Cliente', 15, 60);
  doc.setFontSize(10);
  doc.text(customerInfo.fullName || 'Cliente', 15, 70);
  doc.text(`C.C. ${customerInfo.id || ''}`, 15, 75);
  
  // Dirección en un formato específico
  doc.text("CR 97 # 6 - 25", 15, 80);
  doc.text("Cali - Colombia", 15, 85); // Con guion
  
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
  doc.text('Concepto', currentX + 5, tableY + 6); // Cambié "Item" por "Concepto"
  currentX += (pageWidth - 30) * colWidths[0];
  
  doc.text('Valor', currentX, tableY + 6);
  currentX += (pageWidth - 30) * colWidths[1];
  
  doc.text('Cantidad', currentX, tableY + 6);
  currentX += (pageWidth - 30) * colWidths[2];
  
  doc.text('Total', currentX, tableY + 6);
  
  // Contenido de la tabla
  const contentY = tableY + 20;
  
  // Solo concepto definido por el usuario sin consecutivo
  doc.text(`${invoice.concept || 'Concepto'}`, tableStartX + 5, contentY);
  
  // Valor unitario
  const formattedAmount = formatCurrency(invoice.amount);
  currentX = tableStartX + (pageWidth - 30) * colWidths[0];
  doc.text(formattedAmount, currentX, contentY);
  
  // Cantidad
  currentX += (pageWidth - 30) * colWidths[1];
  doc.text('1', currentX + 5, contentY);
  
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
  doc.text('DaviPlata', 15, bankInfoY + 10);
  doc.text('No. 3113559747', 15, bankInfoY + 15);
  doc.text('Hernan Andres Zapata Quiñonez', 15, bankInfoY + 20);

  // Nombre con link funcional
const linkText = 'Puedes pagar haciendo click aquí';
const linkX = 15;
const linkY = bankInfoY + 25;

doc.setTextColor('#0066CC'); // Azul para link
doc.text(linkText, linkX, linkY);

const textWidth = doc.getTextWidth(linkText);
const textHeight = 4;

// Agregar link (cambia la URL por la que necesites)
doc.link(linkX, linkY - textHeight, textWidth, textHeight, { 
  url: 'https://www.daviplata.com/wps/portal/daviplata/Home/ComoMeterlePlata/!ut/p/z1/pY9NC4JAEIZ_SwevzuRHSrfVwoooDCrbS2hsq7G6spr-_VY6Bdaluc3wPC_vAIUEaJV2BU_bQlap0PuFzq5e7OAqdKa7iIRLjNHy1ouTjei7cP4JRA7Qf3wNDD5-GYLapyMIweBgBUOBvTUKfGRsgHIhs_e7pMpsnwNV7M4UU-ZT6XPetnUzN9DAvu9NLiUXzLzJ0sAxJZdNC8knCXV5TPDhim5LJi9p7Bv4/dz/d5/L2dBISEvZ0FBIS9nQSEh/' 
});

doc.setTextColor(textColor); // Restaurar color
  
  // Total final - alineado horizontalmente con "Cuenta Bancaria"
  doc.setFontSize(14);
  doc.text('Total', pageWidth - 80, bankInfoY); // Misma Y que "Cuenta Bancaria"
  
  doc.setFontSize(14);
  doc.setTextColor(textColor);
  doc.text(formattedAmount, pageWidth - 15, bankInfoY, { align: 'right' }); // Misma Y también
  
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