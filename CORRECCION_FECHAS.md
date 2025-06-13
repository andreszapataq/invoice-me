# 📅 Corrección de Fechas - "Enviar Ahora"

## 🚨 **Problema Resuelto - ACTUALIZACIÓN ZONA HORARIA**

### **Problema Original (Junio 2025)**
Cuando se usaba "📧 Enviar Ahora", había inconsistencias en las fechas:
- ✅ **Correo (título y cuerpo)**: Mostraba fecha correcta (2 junio 2025)
- ❌ **PDF**: Mostraba fecha incorrecta (1 junio 2025)

### **Nuevo Problema Detectado (12 Junio 2025)**
- 🕘 **Enviado**: 12 junio 2025, 9:30 PM (Colombia UTC-5)
- ❌ **Aparecía**: 13 junio 2025 (en PDF y correo)
- 🔍 **Causa**: Sistema usaba UTC sin considerar zona horaria de Colombia

## 🔧 **Correcciones Realizadas**

### **1. Servicio de Email (`lib/email-service.ts`)**
- ✅ Forzar uso de fecha actual para todos los envíos
- ✅ Agregar logging de fecha para debug
- ✅ Eliminar dependencia de la fecha del objeto `scheduledInvoice`
- ✅ **NUEVO**: Usar zona horaria de Colombia (America/Bogota)

```typescript
// ANTES:
const currentDate = new Date();
const currentDateString = currentDate.toISOString().slice(0, 10);

// DESPUÉS (ACTUALIZADO):
const currentDate = new Date();
const colombiaDate = new Date(currentDate.toLocaleString("en-US", {timeZone: "America/Bogota"}));
const currentDateString = colombiaDate.toISOString().slice(0, 10);
```

### **2. Endpoint Send-Now (`app/api/invoices/send-now/route.ts`)**
- ✅ Ignorar día de corte para envío inmediato
- ✅ Usar siempre fecha actual
- ✅ Agregar logging explicativo
- ✅ **NUEVO**: Usar zona horaria de Colombia (America/Bogota)

```typescript
// ANTES:
const currentDate = new Date();
const currentDateOnly = currentDate.toISOString().split('T')[0];

// DESPUÉS (ACTUALIZADO):
// Usar zona horaria de Colombia (UTC-5)
const currentDate = new Date();
const colombiaDate = new Date(currentDate.toLocaleString("en-US", {timeZone: "America/Bogota"}));
const currentDateOnly = colombiaDate.toISOString().split('T')[0];
```

### **3. Generador de PDF (`lib/pdf-generator.ts`)**
- ✅ Manejo mejorado de zona horaria
- ✅ Parseo correcto de fechas
- ✅ Logging para debug
- ✅ **NUEVO**: Logging actualizado para mostrar zona horaria de Colombia

```typescript
// Evita problemas de zona horaria
if (invoice.date.includes('T')) {
  const dateParts = invoice.date.split('T')[0].split('-');
  date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
}

// ACTUALIZADO: Logging con zona horaria
console.log(`📄 PDF generando con fecha: ${invoice.date} -> ${formattedDate} (Colombia UTC-5)`);
```

### **4. Base de Datos - Facturas Programadas (`lib/database.ts`)**
- ✅ **NUEVO**: `getInvoicesDueToday()` usa zona horaria de Colombia
- ✅ **NUEVO**: `calculateNextSendDate()` usa zona horaria de Colombia
- ✅ **NUEVO**: Logging para debug de fechas programadas

```typescript
// ANTES:
const today = new Date().toISOString().split('T')[0];
const now = new Date();

// DESPUÉS (ACTUALIZADO):
// Usar zona horaria de Colombia (UTC-5)
const currentDate = new Date();
const colombiaDate = new Date(currentDate.toLocaleString("en-US", {timeZone: "America/Bogota"}));
const today = colombiaDate.toISOString().split('T')[0];
```

## ✅ **Comportamiento Corregido (ACTUALIZADO)**

### **📧 "Enviar Ahora"**
- ✅ **Fecha del PDF**: Fecha correcta de Colombia (UTC-5)
- ✅ **Fecha del correo**: Fecha correcta de Colombia (UTC-5)
- ✅ **Ignora día de corte**: No importa si seleccionas día 1, 15, 30, etc.
- ✅ **Zona horaria**: Respeta UTC-5 (America/Bogota)

### **⏰ "Programar Envío" (ACTUALIZADO)**
- ✅ **Fechas de programación**: Calculadas en zona horaria de Colombia
- ✅ **Respeta día de corte**: Se envía según hora local colombiana
- ✅ **Verificación diaria**: CRON verifica usando fecha de Colombia
- ✅ **Próximas fechas**: Calculadas correctamente en UTC-5

## 🔍 **Logs para Verificar**

Ahora cuando uses "📧 Enviar Ahora" verás en la consola:

```
⚡ Enviando factura inmediata a email@ejemplo.com
💰 Concepto: Ahorro personal, Monto: $50.000
📅 Fecha de envío: 2025-06-12 (Colombia UTC-5, ignorando día de corte: 15)
📅 Generando PDF con fecha: 2025-06-12 (Colombia UTC-5)
📄 PDF generando con fecha: 2025-06-12 -> 12 junio 2025 (Colombia UTC-5)
📧 [REAL] Enviando factura a email@ejemplo.com usando Resend...
✅ Correo enviado exitosamente. ID: xxxxx
```

Y cuando se procesen **facturas programadas** verás:

```
🔍 [Colombia UTC-5] Verificando facturas para: 2025-06-15
📤 [CRON] Procesando factura: Ahorro mensual para email@ejemplo.com
📅 [Colombia UTC-5] Próxima fecha calculada: 2025-07-15
📅 Generando PDF con fecha: 2025-06-15 (Colombia UTC-5)
📄 PDF generando con fecha: 2025-06-15 -> 15 junio 2025 (Colombia UTC-5)
✅ [CRON] Factura enviada exitosamente a email@ejemplo.com
```

## 🎯 **Resultado Final (ACTUALIZADO)**

- ✅ **PDF**: Fecha correcta según zona horaria de Colombia
- ✅ **Correo**: Fecha correcta según zona horaria de Colombia  
- ✅ **Consistencia**: Ambos usan la misma fecha de Colombia
- ✅ **Envío inmediato**: Ignora día de corte completamente
- ✅ **Zona horaria**: Ahora respeta UTC-5 (America/Bogota)
- ✅ **Base de datos**: Las fechas se guardan en UTC pero se calculan desde hora local

---

## 📝 **Nota Técnica Actualizada**

### **Problema Original**: 
Se creaba fecha con `new Date().toISOString()` en UTC, causando desfase.

### **Problema Detectado (12 Jun 2025)**:
- **Enviado**: 12 jun, 9:30 PM Colombia (UTC-5)
- **Guardado**: 13 jun, 2:35 AM UTC (correcto)
- **Mostrado**: 13 jun (incorrecto, debería ser 12 jun)

### **Solución Final**:
```typescript
// Crear fecha en zona horaria de Colombia
const currentDate = new Date();
const colombiaDate = new Date(currentDate.toLocaleString("en-US", {timeZone: "America/Bogota"}));
const currentDateString = colombiaDate.toISOString().slice(0, 10);
```

**Ahora el sistema:**
1. Toma la hora actual del servidor
2. La convierte a zona horaria de Colombia (UTC-5)
3. Usa esa fecha para PDF y correo
4. La base de datos sigue en UTC (estándar) pero la interfaz muestra fecha local 