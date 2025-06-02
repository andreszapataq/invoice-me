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
  FilterFn,
} from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
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
import { type Invoice } from "@/lib/data"; // Ajusta ruta
import { ScheduledInvoice, supabase } from "@/lib/supabase"; // Importar Supabase
import { createColumns } from "@/components/Columns"; // Importamos la función createColumns en lugar de columns
import { DataTableCore } from "@/components/DataTableCore"; // Ajusta ruta
import { InvoiceForm } from "@/components/InvoiceForm"; // Importar el componente de formulario

// Definimos una función de filtro personalizada que busca en múltiples campos
const fuzzyFilter: FilterFn<Invoice> = (row, columnId, value, addMeta) => {
  // Valor a buscar
  const itemRank = rankItem(row.getValue(columnId), value);
  
  // Guardar el ranking para poder ordenar por relevancia
  addMeta({
    itemRank,
  });
  
  // Devuelve true si el texto coincide con el valor
  return itemRank.passed;
};

export default function Home() {
  // Estado para almacenar las facturas
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const data = React.useMemo(() => invoices, [invoices]); // Usar el estado como fuente de datos
  
  // Función para convertir ScheduledInvoice a Invoice
  const convertScheduledToInvoice = (scheduledInvoice: ScheduledInvoice): Invoice => ({
    id: scheduledInvoice.id,
    status: scheduledInvoice.is_active ? "En Proceso" : "Sin Pago",
    email: scheduledInvoice.email,
    amount: scheduledInvoice.amount,
    frequency: scheduledInvoice.frequency as 'monthly' | 'biweekly',
    concept: scheduledInvoice.concept,
    date: scheduledInvoice.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
  });
  
  // Función para cargar facturas desde Supabase
  const loadInvoices = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: scheduledInvoices, error } = await supabase
        .from('scheduled_invoices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error cargando facturas:', error);
        return;
      }
      
      // Convertir las facturas programadas al formato de la tabla
      const convertedInvoices = scheduledInvoices?.map(convertScheduledToInvoice) || [];
      setInvoices(convertedInvoices);
    } catch (error) {
      console.error('Error cargando facturas:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Cargar facturas al montar el componente
  React.useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);
  
  // Función para cambiar el estado de una factura
  const toggleInvoiceStatus = React.useCallback(async (invoiceId: string) => {
    try {
      // Encontrar la factura actual
      const currentInvoice = invoices.find(inv => inv.id === invoiceId);
      if (!currentInvoice) return;
      
      // Determinar nuevo estado
      const newIsActive = currentInvoice.status !== "En Proceso";
      
      // Actualizar en Supabase
      const { error } = await supabase
        .from('scheduled_invoices')
        .update({ is_active: newIsActive })
        .eq('id', invoiceId);
      
      if (error) {
        console.error('Error actualizando factura:', error);
        return;
      }
      
      // Actualizar estado local
      setInvoices(prevInvoices => 
        prevInvoices.map(invoice => {
          if (invoice.id === invoiceId) {
            const newStatus = newIsActive ? "En Proceso" : "Sin Pago";
            return { ...invoice, status: newStatus };
          }
          return invoice;
        })
      );
    } catch (error) {
      console.error('Error actualizando factura:', error);
    }
  }, [invoices]);
  
  // Función para recargar facturas (para usar en el formulario)
  const refreshInvoices = React.useCallback(() => {
    loadInvoices();
  }, [loadInvoices]);
  
  // Crear las columnas con la función de cambio de estado
  const tableColumns = React.useMemo(
    () => createColumns(toggleInvoiceStatus), 
    [toggleInvoiceStatus]
  );

  // Estados para la tabla (manejados aquí)
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  
  // Estado para el filtro de texto
  const [globalFilter, setGlobalFilter] = React.useState('');

  // Instancia de la tabla (manejada aquí)
  const table = useReactTable({
    data,
    columns: tableColumns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    defaultColumn: {
      // @ts-expect-error - El tipo FilterFnOption necesita ser ignorado aquí
      filterFn: 'fuzzy',
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    // @ts-expect-error - El tipo FilterFnOption necesita ser ignorado aquí
    globalFilterFn: 'fuzzy',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });
  
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);
  
  // Referencia para controlar el timeout del tooltip
  const tooltipTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // Referencia al botón para detectar si el mouse está sobre él
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  
  // Función para cerrar el tooltip de forma definitiva
  const forceCloseTooltip = React.useCallback(() => {
    setIsTooltipOpen(false);
    // Limpiar cualquier timeout pendiente
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
  }, []);
  
  // Cerrar el tooltip cuando cambia el estado del sheet
  React.useEffect(() => {
    forceCloseTooltip();
    
    // Añadimos un event listener global para cerrar el tooltip al hacer clic fuera
    const handleGlobalClick = () => {
      forceCloseTooltip();
    };
    
    document.addEventListener('click', handleGlobalClick);
    
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [isSheetOpen, forceCloseTooltip]);

  return (
    <main className="min-h-screen p-8 md:py-[90px] md:px-[190px]">
      <Header />

      {/* Grid Container para Settings y Tabla */}
      <div className="grid grid-cols-[48px_1fr] gap-6 mt-15">
        {/* Columna 1: Botón de Configuración */}
        <div className="flex items-start relative">
          {/* Los componentes de Tooltip y Sheet están separados para evitar conflictos de estado */}
          
          {/* Primero el Tooltip con su propio provider */}
          <TooltipProvider delayDuration={0}>
            {/* El tooltip solo se mostrará si está abierto Y el sheet está cerrado */}
            <Tooltip 
              open={isTooltipOpen && !isSheetOpen} 
              onOpenChange={(open) => {
                // Evitar que se abra si el sheet está abierto
                if (isSheetOpen) return;
                setIsTooltipOpen(open);
              }}
            >
              <TooltipTrigger asChild>
                <div className="absolute top-0 left-0 z-20 pointer-events-none">
                  {/* Este div fantasma actúa como trigger pero no interactúa con el mouse */}
                  <div style={{ width: '40px', height: '40px' }}></div>
                </div>
              </TooltipTrigger>
              <TooltipContent sideOffset={5}>
                <p>Configuración</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Luego el Sheet, completamente separado */}
          <Sheet 
            open={isSheetOpen} 
            onOpenChange={(open) => {
              setIsSheetOpen(open);
              // Si se abre o cierra el sheet, forzar cierre del tooltip
              forceCloseTooltip();
            }}
          >
            <SheetTrigger asChild>
              <Button 
                ref={buttonRef}
                variant="outline" 
                size="icon" 
                className="shrink-0 relative z-10"
                onMouseEnter={() => {
                  // Solo mostrar el tooltip si el sheet está cerrado
                  if (!isSheetOpen) {
                    // Usar un timeout para evitar parpadeos
                    if (tooltipTimeoutRef.current) {
                      clearTimeout(tooltipTimeoutRef.current);
                    }
                    tooltipTimeoutRef.current = setTimeout(() => {
                      setIsTooltipOpen(true);
                    }, 50);
                  }
                }}
                onMouseLeave={() => {
                  // Cancelar el timeout si existe
                  if (tooltipTimeoutRef.current) {
                    clearTimeout(tooltipTimeoutRef.current);
                    tooltipTimeoutRef.current = null;
                  }
                  setIsTooltipOpen(false);
                }}
                onClick={(e) => {
                  // Al hacer clic en el botón, asegurarnos de cerrar el tooltip
                  forceCloseTooltip();
                  // Evitar propagación del clic para que no active otros manejadores
                  e.stopPropagation();
                }}
              >
                <Settings className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 flex flex-col h-full">
              <SheetHeader className="p-6 pb-4 border-b">
                <SheetTitle>Crear Factura</SheetTitle>
                <SheetDescription>Envía facturas inmediatamente o programa envíos automáticos recurrentes</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-6">
                <InvoiceForm 
                  onCancel={() => setIsSheetOpen(false)} 
                  onSuccess={refreshInvoices}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Columna 2: Tabla y sus controles */}
        <div className="w-full flex justify-center">
          <div className="max-w-[950px] w-full">
            {/* Controles de la tabla */}
            <div className="flex items-center justify-between space-x-4 mb-4">
              <Input
                placeholder="Filtrar por Concepto, Email o Estado..."
                value={globalFilter ?? ''}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="max-w-sm"
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="shrink-0">
                    Columnas <ChevronDown className="ml-2 size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      // Mapeo de IDs a nombres en español
                      const columnNames: Record<string, string> = {
                        date: "Fecha",
                        concept: "Concepto",
                        email: "Email",
                        amount: "Total",
                        status: "Estado",
                        frequency: "Frecuencia"
                        // Añade aquí cualquier otra columna que necesites traducir
                      };
                      
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        >
                          {columnNames[column.id] || column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Componente Core de la Tabla */}
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-sm text-gray-500">Cargando facturas...</div>
              </div>
            ) : (
              <DataTableCore table={table} columnsLength={tableColumns.length} />
            )}

            {/* Fila de Paginación e Información */}
            {!isLoading && (
              <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  {table.getFilteredSelectedRowModel().rows.length} de{" "}
                  {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
