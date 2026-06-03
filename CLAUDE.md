# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Next.js dev server (port 3000). En desarrollo, [instrumentation.ts](instrumentation.ts) importa [lib/scheduler.ts](lib/scheduler.ts) al arrancar el server, que se auto-inicia 5 s después y consulta facturas vencidas cada 60 s.
- `npm run build` — production build.
- `npm start` — run the production build.
- `npm run lint` — `next lint` (ESLint flat config en [eslint.config.mjs](eslint.config.mjs)).

No hay framework de tests configurado.

## Stack

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind 4 + shadcn/ui (Radix). Path alias `@/*` apunta a la raíz. Backend on-demand via API routes; persistencia en Supabase; correos con Resend; PDFs con jsPDF + html2canvas; scheduling productivo con Vercel Cron.

## Variables de entorno

Necesarias en `.env.local` (dev) y en Vercel (prod):

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — cliente Supabase ([lib/supabase.ts](lib/supabase.ts) y [lib/supabase/](lib/supabase/)).
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, usado por [lib/supabase/admin.ts](lib/supabase/admin.ts) para que el cron y el scheduler local **bypassen RLS**. Nunca exponer en cliente.
- `RESEND_API_KEY` — si falta, [lib/email-service.ts](lib/email-service.ts) entra en **modo simulación** (loguea pero no envía). El endpoint [app/api/email/check-config/route.ts](app/api/email/check-config/route.ts) reporta este estado al frontend.
- `EMAIL_FROM` — remitente; default `onboarding@resend.dev`.
- `CRON_SECRET` — el endpoint cron rechaza requests cuyo header `Authorization` no sea `Bearer ${CRON_SECRET}`.
- `NODE_ENV` — controla si el scheduler local de [lib/scheduler.ts](lib/scheduler.ts) se inicia (solo en `development`).

## Autenticación

Auth con Supabase email/password (single-user). Usuario se crea manualmente en el Dashboard de Supabase → Authentication → Users.

- [middleware.ts](middleware.ts) redirige a `/login` cualquier ruta sin sesión salvo `/login`, `/auth/sign-out` y `/api/cron/*`.
- [app/login/page.tsx](app/login/page.tsx) + [components/LoginForm.tsx](components/LoginForm.tsx) usan `supabase.auth.signInWithPassword`.
- [app/auth/sign-out/route.ts](app/auth/sign-out/route.ts) cierra sesión y redirige.
- Tres clientes Supabase: [lib/supabase/client.ts](lib/supabase/client.ts) (browser, cookies), [lib/supabase/server.ts](lib/supabase/server.ts) (server components / route handlers), [lib/supabase/admin.ts](lib/supabase/admin.ts) (service role para cron/scheduler).
- `SupabaseDatabaseManager` ([lib/database.ts](lib/database.ts)) recibe el cliente por constructor — las route handlers instancian con el server client (cookies → RLS por usuario), el cron con `supabaseAdmin` (bypassa RLS).
- RLS habilitado en `scheduled_invoices` y `email_logs` con política única: `FOR ALL TO authenticated USING (auth.uid() IS NOT NULL)`.

## Arquitectura

### Modelo de datos en una sola tabla

Toda la lógica de facturas vive en la tabla `scheduled_invoices` (Supabase). El campo `is_active` distingue dos roles del mismo registro:

- **`is_active: true`** → factura **programada** recurrente. `status: 'Programada'`. `next_send_date` controla cuándo el cron la enviará.
- **`is_active: false`** → registro **histórico** de un envío ya realizado. `status` alterna entre `'Pendiente'` y `'Pagada'` (toggle desde la UI). Estas son las únicas filas a las que se les puede cambiar el estado de pago.

`email_logs` solo guarda traza de éxito/fallo de cada intento de envío.

### Flujos críticos

**Envío inmediato** ([app/api/invoices/send-now/route.ts](app/api/invoices/send-now/route.ts)):
1. Inserta una fila con `is_active: false`, `status: 'Pendiente'` (registro histórico directo).
2. Llama a `emailService.sendInvoiceEmail` con un objeto temporal que usa la fecha actual.
3. Actualiza `last_sent` y registra en `email_logs`.

**Programación** ([app/api/invoices/schedule/route.ts](app/api/invoices/schedule/route.ts)):
1. Inserta una fila con `is_active: true`, `status: 'Programada'`. `next_send_date` se calcula en `dbManager.calculateNextSendDate`.

**Cron de envío** ([app/api/cron/process-invoices/route.ts](app/api/cron/process-invoices/route.ts), [vercel.json](vercel.json) → `0 14 * * *` UTC = 9 AM Colombia):
1. `getInvoicesDueToday()` devuelve facturas activas con `next_send_date <= hoy`.
2. Para cada una: **se crea primero un registro histórico** (`createInvoiceHistoryRecord`), luego se envía el correo. Si el envío falla, el registro histórico se **elimina** (`deleteInvoice`) para no dejar trazabilidad inconsistente.
3. En éxito: la fila programada original se actualiza con nuevo `next_send_date`.

Esto significa que **un envío programado deja dos filas**: la programada (sigue activa) y un nuevo registro histórico marcable como pagado. Cualquier modificación a este flujo debe preservar esa invariante.

### Frontend ([app/page.tsx](app/page.tsx))

- Carga *todas* las filas de `scheduled_invoices` y las mapea a `Invoice` ([lib/data.ts](lib/data.ts)) con `convertScheduledToInvoice`. La fecha mostrada es `next_send_date` para las programadas y `created_at` (convertido a Colombia) para las históricas.
- Tabla con TanStack Table, filtro fuzzy (`@tanstack/match-sorter-utils`), paginación de 5.
- El toggle de status (Pendiente ↔ Pagada) llama a `dbManager.updateInvoiceStatus` y **rechaza filas en estado `'Programada'`** (no se puede marcar como pagada algo que aún no se envió).
- El formulario vive en un `Sheet` lateral ([components/InvoiceForm.tsx](components/InvoiceForm.tsx)) con dos acciones: enviar ahora y programar.

### Scheduler local vs Vercel Cron

- En **dev**, [lib/scheduler.ts](lib/scheduler.ts) corre `setInterval` cada 60 s dentro del proceso de Next.js. Su arranque depende de que algo importe el módulo: [instrumentation.ts](instrumentation.ts) lo hace en el hook `register()` de Next.js, pero **solo cuando `NEXT_RUNTIME === 'nodejs'` y `NODE_ENV === 'development'`**. Útil para iterar, **no se ejecuta en producción**.
- En **prod**, [vercel.json](vercel.json) define un cron diario que pega a `/api/cron/process-invoices`. Cualquier cambio al schedule se hace ahí.

## Convención: zona horaria Colombia (UTC-5)

**Todo cálculo de fechas debe hacerse en `America/Bogota`**. El patrón canónico que se repite en `email-service.ts`, `database.ts`, `pdf-generator.ts`, las API routes y `page.tsx`:

```ts
const colombiaDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }));
const dateString = colombiaDate.toISOString().split('T')[0];
```

Razón: el servidor (Vercel) corre en UTC; un envío hecho a las 9:30 PM Colombia se guardaría como el día siguiente si se usa `new Date().toISOString()` directo. Cualquier cálculo nuevo de fecha debe seguir este patrón o el PDF y el correo mostrarán el día equivocado.

Excepción intencional: para envío inmediato, el `due_date_day` del formulario se **ignora** — siempre se usa la fecha actual de Colombia.

## Convenciones del proyecto

- UI y mensajes de log en español.
- Importes desde `@/lib`, `@/components`, `@/components/ui`.
- Componentes shadcn/ui en [components/ui/](components/ui/) — `components.json` configura el alias y el estilo.
- Moneda: COP, formateada con `Intl.NumberFormat('es-CO')` (helpers en [lib/data.ts](lib/data.ts)).
- Frecuencias permitidas: `'monthly'` (día 1–31) y `'biweekly'` (solo día 1 o 16). Validado en `schedule/route.ts` y en `calculateNextSendDate`.
