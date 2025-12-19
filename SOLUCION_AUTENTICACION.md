# 🔧 SOLUCIÓN: Error "Not authenticated" en Convex

## Problema
Convex está lanzando el error `"Not authenticated"` porque no puede verificar los tokens JWT de Clerk sin el `CLERK_ISSUER_URL` configurado.

## Solución Rápida (2 minutos)

### Paso 1: Obtén tu Clerk Issuer URL

1. Ve a https://dashboard.clerk.com
2. Selecciona tu aplicación
3. Ve a **Settings** → **API Keys**
4. Copia el valor de **"Issuer URL"**
   - Formato: `https://tu-dominio.clerk.accounts.dev`

### Paso 2: Configúralo en Convex

Ejecuta este comando (reemplaza con tu issuer URL):

```bash
npx convex env set CLERK_ISSUER_URL "https://tu-dominio.clerk.accounts.dev"
```

**O usa el script automático:**

```bash
node scripts/get-clerk-issuer.js
```

### Paso 3: Reinicia Convex

1. Detén Convex (Ctrl+C en la terminal donde corre)
2. Reinicia: `npx convex dev`

### Paso 4: Verifica

Intenta iniciar sesión nuevamente. El error debería desaparecer.

---

## ¿Por qué es necesario?

Convex necesita el `CLERK_ISSUER_URL` para:
- Verificar que los tokens JWT vienen de Clerk (seguridad)
- Identificar correctamente al usuario autenticado
- Permitir que `ctx.auth.getUserIdentity()` funcione

Sin esto, Convex no puede verificar los tokens y siempre retorna "Not authenticated".

---

## Solución Alternativa (si el script no funciona)

1. Ve a https://dashboard.convex.dev
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Agrega una nueva variable:
   - **Nombre:** `CLERK_ISSUER_URL`
   - **Valor:** `https://tu-dominio.clerk.accounts.dev`
5. Guarda los cambios
6. Reinicia Convex: `npx convex dev`

---

## Verificación

Después de configurar, deberías ver en los logs de Convex:
- ✅ No más errores "Not authenticated"
- ✅ Las funciones de Convex funcionan correctamente
- ✅ El login redirige correctamente

Si aún ves errores, verifica que:
- El issuer URL esté correcto (debe empezar con `https://` y contener `.clerk.accounts.dev`)
- Convex se haya reiniciado después de configurar la variable
- El token de Clerk se esté pasando correctamente (revisa la consola del navegador)

