"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

import { Invoice, formatCurrency } from "@/lib/data";

// Función para crear las columnas, ahora recibe una función para actualizar el estado
export const createColumns = (
  toggleStatus: (invoiceId: string) => void
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
      
      // Determinar el variant del badge según el estado
      let variant: "default" | "secondary" | "outline" = "secondary";
      if (status === "Pagada") {
        variant = "default";
      } else if (status === "Pendiente") {
        variant = "outline";
      } else if (status === "Programada") {
        variant = "secondary";
      }
      
      return (
        <Badge variant={variant}>
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
    cell: ({ row }) => {
      const invoice = row.original;
      const isPaid = invoice.status === "Pagada";
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => toggleStatus(invoice.id)}
              className={isPaid ? "text-red-600" : "text-green-600"}
            >
              {isPaid ? "Marcar como Pendiente" : "Marcar como Pagada"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Exportamos la versión original para compatibilidad con código existente
export const columns = createColumns(() => {});
