# 📧 Configuración de Email para Invoice Me

## 🚨 **Problema Actual: Los correos no se envían**

Actualmente los correos **solo se simulan** en la consola porque falta la configuración de Resend.

## ✅ **Solución: Configurar Resend**

### 1. **Crear cuenta en Resend**
- Ve a [https://resend.com](https://resend.com)
- Crea una cuenta gratuita
- Verifica tu email

### 2. **Obtener API Key**
- En el dashboard de Resend, ve a **API Keys**
- Crea una nueva API Key
- Copia la clave (empieza con `re_`)

### 3. **Configurar variables de entorno**
Crea un archivo `.env.local` en la raíz del proyecto con:

```bash
# Configuración de Email
RESEND_API_KEY=re_tu_clave_aqui_xxxxxxxxxxxxxxxxx
EMAIL_FROM=onboarding@resend.dev

# Si tienes un dominio verificado, puedes usar:
# EMAIL_FROM=noreply@tudominio.com
```

### 4. **Reiniciar la aplicación**
```bash
npm run dev
```

## 🔍 **Verificar que funciona**

1. Cuando reinicies la app, deberías ver en la consola:
   ```
   ✅ RESEND_API_KEY configurada. Los correos se enviarán realmente.
   ```

2. Al enviar una factura con "📧 Enviar Ahora", verás:
   ```
   📧 [REAL] Enviando factura a email@ejemplo.com usando Resend...
   ✅ Correo enviado exitosamente. ID: xxxxx
   ```

## 🆓 **Límites gratuitos de Resend**
- 100 correos por día
- 3,000 correos por mes
- Perfecto para desarrollo y uso personal

## 🐛 **Sin configuración (modo actual)**
- Los correos se **simulan** en la consola
- Verás mensajes como:
  ```
  📧 [SIMULADO] Enviando factura a email@ejemplo.com
  ⚠️ Para enviar correos reales, configura RESEND_API_KEY en tu archivo .env
  ```

## 📝 **Ejemplo de .env.local completo**
```bash
# Email (Resend)
RESEND_API_KEY=re_tu_clave_aqui
EMAIL_FROM=onboarding@resend.dev

# Supabase (si usas)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima

# Ambiente
NODE_ENV=development
```

---

## 🚀 **Una vez configurado**

La aplicación enviará correos reales con:
- ✅ PDF adjunto de la factura
- ✅ HTML formateado profesional
- ✅ Asunto descriptivo
- ✅ Información completa de la factura 