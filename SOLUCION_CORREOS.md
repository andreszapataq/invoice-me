# 🔧 SOLUCIÓN RÁPIDA: Correos no se envían

## ❌ **Problema**
Los correos no llegan cuando usas "📧 Enviar Ahora" porque están en **modo simulación**.

## ✅ **Solución en 3 pasos**

### 1. **Crear cuenta gratuita en Resend**
```
1. Ve a: https://resend.com
2. Haz clic en "Sign Up"
3. Ingresa tu email y contraseña
4. Verifica tu cuenta por email
```

### 2. **Obtener tu API Key**
```
1. Inicia sesión en Resend
2. Ve al menú "API Keys" 
3. Haz clic en "Create API Key"
4. Copia la clave (empieza con "re_")
```

### 3. **Configurar tu aplicación**
Crea un archivo llamado `.env.local` en la carpeta raíz de tu proyecto:

```bash
# Pega esto en .env.local
RESEND_API_KEY=re_tu_clave_aqui_xxxxxxxxxxxxxxxx
EMAIL_FROM=onboarding@resend.dev
```

### 4. **Reiniciar la aplicación**
```bash
# Detén la aplicación (Ctrl+C) y reinicia:
npm run dev
```

## 🎉 **¡Listo!**

- ✅ Ahora verás "✅ Correos Configurados" en el formulario
- ✅ Los correos se enviarán realmente
- ✅ Incluirán el PDF adjunto

## 🔍 **¿Cómo verificar que funciona?**

1. **En la consola verás:**
   ```
   ✅ RESEND_API_KEY configurada. Los correos se enviarán realmente.
   📧 [REAL] Enviando factura a email@ejemplo.com usando Resend...
   ✅ Correo enviado exitosamente. ID: xxxxx
   ```

2. **En el formulario verás:**
   - Banner verde: "✅ Correos Configurados"
   - En lugar del banner amarillo de simulación

## 🆓 **Límites gratuitos**
- 100 correos por día
- 3,000 correos por mes
- Suficiente para uso personal

## 📧 **Estructura del .env.local**
```bash
# Email (obligatorio para envíos reales)
RESEND_API_KEY=re_tu_clave_aqui
EMAIL_FROM=onboarding@resend.dev

# Supabase (si ya lo tienes configurado)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

---

## ⚠️ **Nota importante**
- El archivo `.env.local` NO debe subirse a git (ya está en .gitignore)
- Puedes usar `EMAIL_FROM=onboarding@resend.dev` para pruebas
- Para un dominio propio, debes verificarlo en Resend primero 