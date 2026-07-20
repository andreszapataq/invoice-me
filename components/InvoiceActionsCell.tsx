"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Invoice, formatCurrency } from "@/lib/data";

interface InvoiceActionsCellProps {
  invoice: Invoice;
  onToggleStatus: (invoiceId: string) => void;
  onDelete: (invoiceId: string) => Promise<void>;
}

export function InvoiceActionsCell({
  invoice,
  onToggleStatus,
  onDelete,
}: InvoiceActionsCellProps) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const isPaid = invoice.status === "Pagada";
  const isScheduled = invoice.status === "Programada";

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(invoice.id);
      setConfirmOpen(false);
    } catch (error) {
      console.error("Error eliminando factura:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          {!isScheduled && (
            <DropdownMenuItem
              onClick={() => onToggleStatus(invoice.id)}
              className={isPaid ? "text-red-600" : "text-green-600"}
            >
              {isPaid ? "Marcar como Pendiente" : "Marcar como Pagada"}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={(e) => {
              // Evitar que el foco vuelva al trigger antes de abrir el diálogo
              e.preventDefault();
              setConfirmOpen(true);
            }}
          >
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={!isDeleting}>
          <DialogHeader>
            <DialogTitle>¿Eliminar esta factura?</DialogTitle>
            <DialogDescription>
              {isScheduled ? (
                <>
                  Esta es una factura <strong>programada</strong>. Al eliminarla
                  se cancelan sus envíos automáticos futuros. Esta acción no se
                  puede deshacer.
                </>
              ) : (
                <>
                  Se eliminará el registro de{" "}
                  <strong>{invoice.concept}</strong> por{" "}
                  <strong>{formatCurrency(invoice.amount)}</strong>. Esta acción
                  no se puede deshacer.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
