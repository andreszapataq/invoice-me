# 🚀 Configuración para Deployment en Vercel

## ✅ Archivos Ya Creados
- `app/api/cron/process-invoices/route.ts` - Endpoint para cron jobs
- `vercel.json` - Configuración de cron (todos los días a las 2 PM UTC / 9 AM Colombia)

## 📋 Variables de Entorno Requeridas

Configura estas variables en **Vercel > Settings > Environment Variables**:

### 🔑 Email Configuration (Resend)
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@tudominio.com
```

### 🗄️ Supabase (Ya configuradas - usar las mismas)
```env
NEXT_PUBLIC_SUPABASE_URL=https://badfejmdyjqrjlvmsgqa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 🔐 Cron Security
```env
CRON_SECRET=genera_una_clave_secreta_aleatoria_aqui
NODE_ENV=production
```

## 🎯 Pasos para Deployment

### 1. Configurar Resend (Email)
1. Ve a [https://resend.com](https://resend.com)
2. Crea cuenta gratuita
3. Ve a **API Keys** y crea nueva clave
4. Copia la clave (empieza con `re_`)

### 2. Desplegar en Vercel
1. Ve a [https://vercel.com](https://vercel.com)
2. Conecta con tu cuenta de GitHub
3. Clic en **"New Project"**
4. Selecciona el repositorio `invoice-me`
5. Clic en **"Deploy"**

### 3. Configurar Variables de Entorno
En tu proyecto de Vercel:
1. Ve a **Settings > Environment Variables**
2. Agrega todas las variables listadas arriba
3. Para `CRON_SECRET` genera una clave aleatoria segura

### 4. Verificar Cron Jobs
1. Ve a **Settings > Functions**
2. Busca **"Cron Jobs"** - debe estar habilitado
3. Deberías ver:
   - **Path**: `/api/cron/process-invoices`
   - **Schedule**: `0 14 * * *` (2 PM UTC = 9 AM Colombia)
   - **Status**: Active

## 📊 Cómo Funciona

### ⏰ Horario de Ejecución
- **Cron Job**: Todos los días a las 2:00 PM UTC (9:00 AM Colombia)
- **Facturas Inmediatas**: Funcionan igual que antes
- **Facturas Programadas**: Se envían automáticamente sin servidor local

### 🔍 Monitoreo
- **Logs de Vercel**: `vercel logs --follow`
- **Base de datos**: Tabla `email_logs` para historial completo
- **Endpoint manual**: `GET /api/cron/process-invoices` (con autorización)

## 🎉 ¡Listo!

Una vez configurado:
- Las facturas inmediatas funcionan inmediatamente
- Las facturas programadas se envían automáticamente
- Todo se registra en Supabase
- No necesitas mantener servidor local encendido

## 🔧 Para Cambiar Horario

Edita `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/process-invoices",
      "schedule": "0 8 * * *"    // 8 AM UTC (3 AM Colombia)
    }
  ]
}
```

## 💰 Costos (Todo Gratis para Uso Personal)
- **Vercel**: Gratis hasta 100GB bandwidth/mes
- **Resend**: Gratis hasta 3,000 emails/mes  
- **Supabase**: Gratis hasta 500MB DB 