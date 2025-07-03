# 📋 Sistema de Trazabilidad de Facturas

## 🎯 Problema Resuelto

Anteriormente, cuando una factura programada se enviaba automáticamente, solo se actualizaba la fecha para el próximo envío, sin crear un registro histórico. Esto causaba pérdida de trazabilidad y no permitía el seguimiento de pagos.

## ✅ Solución Implementada

### 🔄 Flujo Actual de Facturas Programadas

Cuando una factura programada se envía automáticamente:

1. **Se crea un registro histórico** con:
   - `is_active: false` (no se procesa automáticamente)
   - `status: 'Pendiente'` (estado inicial)
   - `created_at`: fecha y hora del envío
   - `last_sent`: fecha y hora del envío

2. **La factura programada original se mantiene** con:
   - `is_active: true` (sigue programada para futuros envíos)
   - `status: 'Programada'` 
   - `next_send_date`: actualizada para el próximo envío

### 📊 Tipos de Registros en la Tabla

La aplicación ahora muestra tres tipos de registros:

#### 1. **Facturas Programadas** 🗓️
- `status: 'Programada'`
- `is_active: true`
- Fecha mostrada: `next_send_date` (fecha futura de envío)
- **No se pueden marcar como pagadas** hasta que se envíen

#### 2. **Facturas Enviadas - Pendientes** 📤
- `status: 'Pendiente'`
- `is_active: false`
- Fecha mostrada: `created_at` (fecha de envío)
- **Se pueden marcar como pagadas**

#### 3. **Facturas Enviadas - Pagadas** ✅
- `status: 'Pagada'`
- `is_active: false`
- Fecha mostrada: `created_at` (fecha de envío)
- **Se pueden marcar como pendientes**

### 🔧 Funcionalidades del Sistema

#### ✨ Envío Inmediato
- Crea directamente un registro con `status: 'Pendiente'`
- No es una factura programada (is_active: false)

#### ⏰ Programación Automática
- Crea una factura con `status: 'Programada'`
- Se procesa automáticamente según la frecuencia configurada
- Cuando se envía, **genera un registro histórico adicional**

#### 💰 Seguimiento de Pagos
- Los registros históricos permiten cambiar entre "Pendiente" ↔ "Pagada"
- Las facturas programadas no se pueden marcar como pagadas

#### 🕒 Registros Históricos Retroactivos
- **Método disponible**: `dbManager.createRetroactiveHistoryRecord(invoice, 'YYYY-MM-DD')`
- Permite crear registros de facturas enviadas antes de implementar el sistema
- Útil para mantener el historial completo desde el inicio
- **Ejemplo de uso**: Crear registro para facturas enviadas automáticamente que no tienen registro histórico

### 🎨 Interfaz de Usuario

#### 📋 Tabla de Facturas
- **Verde**: Facturas pagadas
- **Amarillo**: Facturas pendientes
- **Azul**: Facturas programadas (futuras)

#### 🔄 Cambio de Estado
- Click en el badge de estado para alternar entre "Pendiente" y "Pagada"
- Solo disponible para facturas enviadas (no programadas)

### 🔍 Beneficios del Nuevo Sistema

1. **📈 Trazabilidad Completa**
   - Historial de todas las facturas enviadas
   - Fechas exactas de envío
   - Estado de pago individual por factura

2. **💼 Mejor Gestión Financiera**
   - Seguimiento de pagos pendientes vs pagados
   - Visualización clara del flujo de caja

3. **🔄 Continuidad de Programación**
   - Las facturas programadas siguen enviándose automáticamente
   - Sin interrupciones en el flujo automático

4. **🎯 Flexibilidad de Estado**
   - Cambio manual entre "Pendiente" y "Pagada"
   - Control granular del estado de cada envío

5. **⏮️ Capacidad Retroactiva**
   - Crear registros para facturas enviadas anteriormente
   - Mantener historial completo desde cualquier fecha

### 🛠️ Implementación Técnica

#### Base de Datos
- **Una sola tabla**: `scheduled_invoices`
- **Campo clave**: `is_active` diferencia entre programadas y históricas
- **Campo status**: "Programada", "Pendiente", "Pagada"

#### Proceso Automático
1. Cron job identifica facturas para enviar
2. Crea registro histórico antes del envío
3. Envía el correo electrónico
4. Si éxito: actualiza próxima fecha de envío
5. Si falla: elimina el registro histórico

#### Frontend
- Carga todos los registros de la tabla
- Filtra y muestra según el tipo
- Permite toggle de estado solo en registros históricos

#### Métodos Disponibles
```typescript
// Crear registro histórico automático (fecha actual)
dbManager.createInvoiceHistoryRecord(invoice)

// Crear registro histórico con fecha específica
dbManager.createRetroactiveHistoryRecord(invoice, '2025-07-02')

// Obtener todas las facturas
dbManager.getAllInvoices()
```

### 📝 Caso de Uso: Factura del 2 de Julio

**Situación**: Una factura programada se envió automáticamente el 2 de julio, pero antes de implementar el sistema de trazabilidad, por lo que no se creó registro histórico.

**Solución**: 
1. ✅ Se identificó la factura programada activa ("Ahorro Personal")
2. ✅ Se creó un registro histórico retroactivo para el 2 de julio  
3. ✅ Estado inicial: "Pendiente" (listo para cambiar a "Pagada")
4. ✅ Factura programada original se mantiene para futuros envíos

**Resultado**:
- **Registro histórico**: ID `49acec0f-9257-4cf3-adc6-f6a7d449d7f7`
- **Concepto**: "Ahorro Personal" 
- **Monto**: $200.000
- **Fecha**: 2 de julio 2025
- **Estado**: Pendiente (se puede cambiar a Pagada desde la interfaz)

### 🚀 Próximos Pasos

El sistema está completamente funcional y listo para:
- ✅ Crear facturas inmediatas
- ✅ Programar facturas automáticas  
- ✅ Generar registros históricos automáticamente
- ✅ Crear registros históricos retroactivos
- ✅ Hacer seguimiento de pagos
- ✅ Mantener trazabilidad completa

No se requieren cambios adicionales en la base de datos o configuración. 