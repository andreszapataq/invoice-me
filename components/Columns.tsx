"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { InvoiceActionsCell } from "@/components/InvoiceActionsCell";

import { Invoice, formatCurrency } from "@/lib/data";

// Función para crear las columnas, ahora recibe funciones para actualizar estado y eliminar
export const createColumns = (
  toggleStatus: (invoiceId: string) => void,
  deleteInvoice: (invoiceId: string) => Promise<void>
): ColumnDef<Invoice>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <div
          className="flex cursor-pointer items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha
          {column.getIsSorted() === "desc" ? (
            <ArrowUpDown className="ml-2 size-4 opacity-50" />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUpDown className="ml-2 size-4" />
          ) : (
            <ArrowUpDown className="ml-2 size-4 opacity-50" />
          )}
        </div>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("date") as string;
      // Crear fecha local para evitar problemas de zona horaria
      const [year, month, day] = date.split('-').map(Number);
      const localDate = new Date(year, month - 1, day);
      // Formatear la fecha a formato español (DD/MM/YYYY)
      const formattedDate = localDate.toLocaleDateString('es-ES');
      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: "concept",
    header: "Concepto",
    cell: ({ row }) => <div>{row.getValue("concept")}</div>,
    filterFn: (row, id, value) => {
      return String(row.getValue(id))
        .toLowerCase()
        .includes(String(value).toLowerCase());
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
    filterFn: (row, id, value) => {
      return String(row.getValue(id))
        .toLowerCase()
        .includes(String(value).toLowerCase());
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      return <div className="text-right font-medium">{formatCurrency(amount)}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      const statusStyles: Record<string, string> = {
        Pagada:
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
        Pendiente:
          "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300",
        Programada:
          "border-transparent bg-secondary text-secondary-foreground",
      };

      return (
        <Badge variant="outline" className={statusStyles[status]}>
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return String(row.getValue(id))
        .toLowerCase()
        .includes(String(value).toLowerCase());
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <InvoiceActionsCell
        invoice={row.original}
        onToggleStatus={toggleStatus}
        onDelete={deleteInvoice}
      />
    ),
  },
];

// Exportamos la versión original para compatibilidad con código existente
export const columns = createColumns(
  () => {},
  async () => {}
);
