export type Invoice = {
  id: string;
  status: "Pagado" | "En Proceso" | "Sin Pago";
  email: string;
  amount: number; 
};

export const sampleInvoices: Invoice[] = [
  // ... tus datos de ejemplo ...
  { id: "inv-001", status: "Pagado", email: "ken99@example.com", amount: 316.00 },
  { id: "inv-002", status: "Pagado", email: "abe45@example.com", amount: 242.00 },
  { id: "inv-003", status: "En Proceso", email: "monserrat44@example.com", amount: 837.00 },
  { id: "inv-004", status: "Pagado", email: "silas22@example.com", amount: 874.00 },
  { id: "inv-005", status: "Sin Pago", email: "carmella@example.com", amount: 721.00 },
];

// Helper de formato (opcional pero útil)
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD", 
  }).format(amount);
};
