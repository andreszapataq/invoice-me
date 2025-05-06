import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button"; // Importar Button
import {
  Sheet,
  SheetContent,
  SheetDescription, // Opcional
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
import { Settings } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen p-8 md:py-[90px] md:px-[190px]">
      <Header />
      <div className="mt-15"> {/* Añade un margen superior si es necesario */}
        <TooltipProvider>
          <Sheet>
            <Tooltip>
              <TooltipTrigger asChild>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="size-4" />
                  </Button>
                </SheetTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Configuración</p>
              </TooltipContent>
            </Tooltip>
            <SheetContent side="left" className="p-6"> {/* <-- Aquí especificamos que salga de la izquierda */}
              <SheetHeader>
                <SheetTitle>Menú</SheetTitle>
                <SheetDescription>
                  Aquí puedes poner opciones o filtros.
                </SheetDescription>
              </SheetHeader>
              <div className="p-4">
                {/* Contenido del Sheet */}
                <p>Contenido del menú lateral...</p>
                {/* Por ejemplo, podrías poner aquí un formulario, filtros, etc. */}
              </div>
              {/* Puedes añadir un SheetFooter si lo necesitas */}
            </SheetContent>
          </Sheet>
        </TooltipProvider>
      </div>
    </main>
  );
}
