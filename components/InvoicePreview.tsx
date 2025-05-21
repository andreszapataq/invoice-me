import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Invoice } from '@/lib/data';
import { generateInvoicePDF } from '@/lib/pdf-generator';

// Interfaz para la información del cliente
interface CustomerInfo {
  name?: string;
  fullName?: string;
  address?: string;
  id?: string;
}

interface InvoicePreviewProps {
  invoice: Invoice;
  customerInfo?: CustomerInfo;
}

export function InvoicePreview({ invoice, customerInfo = {} }: InvoicePreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Generar PDF al cargar el componente
  useEffect(() => {
    const generatePdf = async () => {
      setIsLoading(true);
      try {
        const pdfData = await generateInvoicePDF(invoice, customerInfo);
        setPdfUrl(pdfData);
      } catch (error) {
        console.error('Error al generar PDF:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (invoice) {
      generatePdf();
    }
  }, [invoice, customerInfo]);

  // Función para descargar el PDF
  const handleDownload = () => {
    if (!pdfUrl) return;
    
    // Crear un enlace temporal
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `factura-${invoice.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para enviar la factura por correo
  const handleSendEmail = () => {
    // Esta funcionalidad requeriría una implementación de backend
    alert(`Se enviará la factura a: ${invoice.email}`);
    // Aquí iría la lógica para enviar el correo electrónico
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h3 className="font-medium mb-4">Vista previa de la factura</h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-[600px] w-full">
          <p>Generando factura...</p>
        </div>
      ) : pdfUrl ? (
        <div className="flex flex-col w-full">
          <iframe 
            src={pdfUrl}
            className="w-full h-[600px] border border-gray-200 rounded-md"
            title="Vista previa de factura"
          />
          
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={handleDownload}>
              Descargar PDF
            </Button>
            <Button onClick={handleSendEmail}>
              Enviar por correo
            </Button>
          </div>
        </div>
      ) : (
        <p>No se pudo generar la vista previa.</p>
      )}
    </div>
  );
} 