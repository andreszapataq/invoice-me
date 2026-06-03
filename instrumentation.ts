// Next.js ejecuta register() una sola vez al arrancar el server.
// Lo usamos para auto-iniciar el scheduler local SOLO en desarrollo.
// En producción el envío lo maneja Vercel Cron (vercel.json), así que no se carga.
export async function register() {
  if (
    process.env.NEXT_RUNTIME === 'nodejs' &&
    process.env.NODE_ENV === 'development'
  ) {
    // Importar el módulo dispara su auto-inicio (setTimeout en lib/scheduler.ts).
    await import('./lib/scheduler');
  }
}
