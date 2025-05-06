"use client"; // Necesario porque usamos hooks (useState, useReactTable)

import * as React from "react"; // Importar React
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Settings } from "lucide-react";

import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
/* import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; */
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Importaciones de datos y componentes de tabla
import { sampleInvoices } from "@/lib/data"; // Ajusta ruta
import { columns } from "@/components/Columns"; // Ajusta ruta
import { DataTableCore } from "@/components/DataTableCore"; // Ajusta ruta

export default function Home() {
  const data = React.useMemo(() => sampleInvoices, []); // Datos
  const tableColumns = React.useMemo(() => columns, []); // Columnas

  // Estados para la tabla (manejados aquí)
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Instancia de la tabla (manejada aquí)
  const table = useReactTable({
    data,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <main className="min-h-screen p-8 md:py-[90px] md:px-[190px]">
      <Header />

      {/* Botón Configuración (Sheet + Tooltip) - Directly below Header */}
      <div className="mt-4 mb-6"> {/* Spacing for the button */}
        <TooltipProvider>
          <Sheet>
            <Tooltip>
              <TooltipTrigger asChild>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Settings className="size-4" />
                  </Button>
                </SheetTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Configuración</p>
              </TooltipContent>
            </Tooltip>
            <SheetContent side="left" className="p-6">
              <SheetHeader>
                <SheetTitle>Menú</SheetTitle>
                <SheetDescription>Opciones o filtros.</SheetDescription>
              </SheetHeader>
              <div className="p-4">Contenido del menú...</div>
            </SheetContent>
          </Sheet>
        </TooltipProvider>
      </div>

      {/* Container for Table Area (Centered & Max Width) */}
      <div className="max-w-6xl mx-auto"> {/* Adjust max-w- as needed */}
        {/* --- Fila de Controles Superiores (Input y Columns) --- */}
        <div className="flex items-center justify-between py-4 space-x-4">
          {/* Input de Filtro - Aligned Left within this container */}
          <Input
            placeholder="Filter emails..."
            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("email")?.setFilterValue(event.target.value)
            }
            className="max-w-sm" /* Removed flex-grow */
          />

          {/* Botón Columnas - Aligned Right within this container */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0">
                Columns <ChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* --- Fin Fila de Controles --- */}

        {/* Componente Core de la Tabla */}
        <DataTableCore table={table} columnsLength={tableColumns.length} />

        {/* --- Fila de Paginación e Información --- */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
        {/* --- Fin Fila de Paginación --- */}
      </div>
      {/* End Container for Table Area */}
    </main>
  );
}
