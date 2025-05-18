export type Invoice = {
  id: string;
  status: "Pagado" | "En Proceso" | "Sin Pago";
  email: string;
  amount: number;
  frequency: "monthly" | "biweekly";
  concept: string;
  date: string; // Fecha de generación de la factura
};

export const sampleInvoices: Invoice[] = [
  // ... tus datos de ejemplo ...
  { id: "inv-001", status: "Pagado", email: "ken99@example.com", amount: 316.00, frequency: "monthly", concept: "Ahorro personal", date: "2023-10-15" },
  { id: "inv-002", status: "Pagado", email: "abe45@example.com", amount: 242.00, frequency: "biweekly", concept: "Fondo de emergencia", date: "2023-10-01" },
  { id: "inv-003", status: "Sin Pago", email: "monserrat44@example.com", amount: 837.00, frequency: "monthly", concept: "Inversión", date: "2023-11-15" },
  { id: "inv-004", status: "Pagado", email: "silas22@example.com", amount: 874.00, frequency: "monthly", concept: "Educación", date: "2023-11-01" },
  { id: "inv-005", status: "Sin Pago", email: "carmella@example.com", amount: 721.00, frequency: "biweekly", concept: "Viajes", date: "2023-12-01" },
];

// Helper de formato (opcional pero útil)
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Para formatear la entrada de moneda COP
export const formatCurrencyInput = (value: string): string => {
  // Remover caracteres no numéricos
  const numericValue = value.replace(/[^\d]/g, '');
  
  if (!numericValue) return '';
  
  // Convertir a número y formatear con separadores de miles
  const number = parseInt(numericValue, 10);
  return number.toLocaleString('es-CO');
};

// Para convertir el valor formateado de vuelta a número
export const parseCurrencyValue = (formattedValue: string): number => {
  // Remover separadores de miles y cualquier caracter no numérico
  const numericString = formattedValue.replace(/\D/g, '');
  return numericString ? parseInt(numericString, 10) : 0;
};
