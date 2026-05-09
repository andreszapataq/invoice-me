import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";

export const metadata = {
  title: "Iniciar sesión · Invoice Me",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
