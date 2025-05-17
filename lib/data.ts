export type Invoice = {
  id: string;
  status: "Pagado" | "En Proceso" | "Sin Pago";
  email: string;
  amount: number;
  frequency: "monthly" | "biweekly";
  concept: string;
};

export const sampleInvoices: Invoice[] = [
  // ... tus datos de ejemplo ...
  { id: "inv-001", status: "Pagado", email: "ken99@example.com", amount: 316.00, frequency: "monthly", concept: "Ahorro personal" },
  { id: "inv-002", status: "Pagado", email: "abe45@example.com", amount: 242.00, frequency: "biweekly", concept: "Fondo de emergencia" },
  { id: "inv-003", status: "En Proceso", email: "monserrat44@example.com", amount: 837.00, frequency: "monthly", concept: "Inversión" },
  { id: "inv-004", status: "Pagado", email: "silas22@example.com", amount: 874.00, frequency: "monthly", concept: "Educación" },
  { id: "inv-005", status: "Sin Pago", email: "carmella@example.com", amount: 721.00, frequency: "biweekly", concept: "Viajes" },
];

// Helper de formato (opcional pero útil)
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD", 
  }).format(amount);
};
