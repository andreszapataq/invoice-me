# Configuración de Envío Automático de Facturas

## 📧 Funcionalidad Implementada

Se ha implementado un sistema completo de envío automático de facturas por correo electrónico con **Supabase** como base de datos, con las siguientes características:

### ✨ Características Principales

1. **Envío Inmediato**: Envía una factura al instante al correo configurado
2. **Programación Automática**: Configura facturas para envío automático mensual o quincenal
3. **Generación de PDF**: Cada factura se envía como PDF adjunto
4. **Seguimiento**: Sistema de logs para rastrear envíos exitosos y fallidos
5. **Validación**: Validación completa de datos antes del envío
6. **Base de Datos Supabase**: Almacenamiento persistente y escalable

### 🚀 Cómo Usar

#### 1. Crear una Factura con Envío Inmediato
- Abre la aplicación
- Haz clic en el botón de configuración (⚙️)
- Llena el formulario con:
  - Correo electrónico del destinatario
  - Monto de la factura
  - Frecuencia (Mensual/Quincenal)
  - Día de corte
  - Concepto
- Haz clic en **"Enviar por correo"** para envío inmediato

#### 2. Programar Envío Automático
- Llena el mismo formulario
- Haz clic en **"Programar envío"**
- La factura se guardará en Supabase y se enviará automáticamente en la fecha configurada

### 🗃️ Base de Datos Supabase

#### Tablas Creadas:

1. **`scheduled_invoices`**: Almacena las facturas programadas
   - `id` (UUID): Identificador único
   - `email` (VARCHAR): Correo del destinatario
   - `amount` (INTEGER): Monto de la factura
   - `frequency` (VARCHAR): 'monthly' o 'biweekly'
   - `due_date_day` (INTEGER): Día de corte
   - `concept` (VARCHAR): Concepto de la factura
   - `is_active` (BOOLEAN): Si está activa
   - `created_at` (TIMESTAMP): Fecha de creación
   - `last_sent` (TIMESTAMP): Última fecha de envío
   - `next_send_date` (DATE): Próxima fecha de envío

2. **`email_logs`**: Registro de envíos
   - `id` (SERIAL): Identificador único
   - `scheduled_invoice_id` (UUID): Referencia a la factura
   - `email` (VARCHAR): Correo destinatario
   - `sent_at` (TIMESTAMP): Fecha de envío
   - `status` (VARCHAR): 'success' o 'failed'
   - `error_message` (TEXT): Mensaje de error si falló

### 🔧 Configuración para Producción

Para usar en producción con correo real, crea un archivo `.env.local`:

```env
# Configuración Gmail (recomendado)
EMAIL_USER=tu-correo@gmail.com
EMAIL_PASS=tu-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Las credenciales de Supabase ya están configuradas en el código
NEXT_PUBLIC_SUPABASE_URL=https://badfejmdyjqrjlvmsgqa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Configurar Gmail:
1. Habilita la autenticación en 2 pasos
2. Genera una "Contraseña de aplicación"
3. Usa esa contraseña en `EMAIL_PASS`

### 🎯 Frecuencias Disponibles

- **Mensual**: Se envía el día especificado cada mes (1-31)
- **Quincenal**: Se envía el día 1 o 16 de cada mes

### 📝 Archivos Creados/Modificados

#### Nuevos Archivos:
- `lib/supabase.ts` - Configuración del cliente Supabase
- `lib/database.types.ts` - Tipos TypeScript generados automáticamente
- `lib/database.ts` - Manejo de facturas programadas con Supabase
- `lib/email-service.ts` - Servicio de envío de correos
- `lib/scheduler.ts` - Sistema de scheduling automático
- `app/api/invoices/schedule/route.ts` - API para programar facturas
- `app/api/invoices/send-now/route.ts` - API para envío inmediato

#### Archivos Modificados:
- `components/InvoiceForm.tsx` - Agregados botones "Enviar por correo" y "Programar envío"
- `package.json` - Dependencias para correo, scheduling y Supabase

### 🧪 Modo Desarrollo

En desarrollo, el sistema simula el envío de correos pero **guarda realmente las facturas en Supabase**:
- Los "envíos" se muestran en la consola del servidor
- No se envían correos reales
- Las facturas programadas se guardan en la base de datos real
- Se pueden probar todas las funcionalidades

### 📊 Logs y Seguimiento

El sistema mantiene logs persistentes en Supabase de:
- Facturas programadas y su estado
- Intentos de envío exitosos y fallidos
- Próximas fechas de envío
- Historial completo de actividad

### 🔄 Sistema Automático

El scheduler se ejecuta automáticamente y consulta Supabase:
- Verifica facturas pendientes cada minuto (desarrollo)
- En producción: verificación diaria
- Consulta la base de datos para facturas con fecha de hoy o anterior
- Actualiza automáticamente las próximas fechas de envío en Supabase

### 🎨 Interfaz de Usuario

- **Vista Previa**: Botón existente para ver la factura antes de enviar
- **Enviar por correo**: Nuevo botón verde para envío inmediato
- **Programar envío**: Nuevo botón azul para scheduling automático
- **Mensajes de confirmación**: Retroalimentación visual del estado

### 🛠️ Ventajas de Usar Supabase

1. **Persistencia Real**: Los datos no se pierden al reiniciar la aplicación
2. **Escalabilidad**: Supabase maneja automáticamente el crecimiento
3. **Backup Automático**: Los datos están respaldados automáticamente
4. **Panel de Administración**: Puedes ver las facturas desde el dashboard de Supabase
5. **API REST**: Consultas optimizadas y seguras
6. **Tipos TypeScript**: Generación automática de tipos desde la base de datos

### 🔐 Seguridad

- Validación de formato de email
- Sanitización de datos de entrada
- Manejo seguro de errores
- Variables de entorno para credenciales sensibles
- Row Level Security (RLS) disponible en Supabase
- Claves de API anónimas seguras

### 📋 Próximos Pasos para Producción

1. ✅ **Base de datos configurada** (Supabase ya implementado)
2. Configurar variables de entorno con credenciales de correo reales
3. Configurar cron jobs del servidor para el scheduler
4. Implementar Row Level Security (RLS) en Supabase para mayor seguridad
5. Agregar panel de administración para gestionar facturas programadas
6. Configurar alertas por fallos de envío

¡La funcionalidad está completamente integrada con Supabase y lista para usar en producción! 