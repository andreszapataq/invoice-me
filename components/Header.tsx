"use client";

import * as React from "react";
import { Loader2, LogOut } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Header() {
  const [email, setEmail] = React.useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  const initial = email ? email[0].toUpperCase() : "?";

  return (
    <header className="flex items-center justify-between mb-8">
      <h1 className="text-2xl font-bold">Invoice Me</h1>
      <div className="flex items-center gap-3">
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="size-10">
                <AvatarImage src="https://github.com/shadcn.png" alt={email ?? ""} />
                <AvatarFallback>{initial}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            {email && <TooltipContent>{email}</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
        <form
          action="/auth/sign-out"
          method="post"
          onSubmit={() => setIsSigningOut(true)}
        >
          <Button
            type="submit"
            variant="outline"
            size="icon"
            aria-label={isSigningOut ? "Cerrando sesión" : "Cerrar sesión"}
            title="Cerrar sesión"
            disabled={isSigningOut}
            aria-busy={isSigningOut}
          >
            {isSigningOut ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
          </Button>
        </form>
      </div>
    </header>
  );
}
