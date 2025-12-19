# Verificación de Configuración Clerk-Convex

## ✅ Estado Actual

### Variable de Entorno Configurada
- **CLERK_ISSUER_URL**: `https://patient-frog-77.clerk.accounts.dev`
- ✅ Variable correctamente configurada en Convex
- ✅ Formato correcto (https://...clerk.accounts.dev)

### Archivos de Configuración

1. **`convex/auth.config.ts`** ✅
   - Lee `CLERK_ISSUER_URL` desde `process.env.CLERK_ISSUER_URL`
   - Configura el provider de autenticación con:
     - `domain`: El issuer URL de Clerk
     - `applicationID`: "convex"

2. **`lib/convex-provider.tsx`** ✅
   - Pasa tokens de Clerk a Convex mediante `fetchAuthToken`
   - Intenta usar template "convex" primero, luego token por defecto
   - Configurado correctamente

3. **`convex/auth.ts`** ✅
   - Helper `getClerkUserId()` obtiene el user ID desde `ctx.auth.getUserIdentity()`
   - Funciona cuando la autenticación está configurada correctamente

## 📋 Pasos Siguientes

### 1. Reiniciar Convex (IMPORTANTE)

Si Convex está corriendo, necesitas reiniciarlo para que cargue la variable de entorno:

```bash
# Detener Convex (Ctrl+C en la terminal donde corre)
# Luego reiniciar:
npx convex dev
```

### 2. Verificar en los Logs de Convex

Al iniciar Convex, revisa los logs en la terminal. Deberías ver:

**✅ Configuración Correcta:**
- NO deberías ver el warning: "⚠️ [Convex Auth] CLERK_ISSUER_URL no está configurado"
- Si no ves el warning, significa que la variable se está leyendo correctamente

**❌ Si ves el warning:**
- La variable no se está leyendo correctamente
- Verifica que reiniciaste Convex después de configurar la variable
- Verifica que usaste `npx convex env set` (no solo `.env.local`)

### 3. Probar la Autenticación

1. **Iniciar sesión en la aplicación**
   - Ve a `http://localhost:3000/login`
   - Inicia sesión con tu cuenta de Clerk

2. **Verificar en la consola del navegador**
   - Abre DevTools (F12)
   - Ve a la pestaña "Console"
   - NO deberías ver errores de "Not authenticated"
   - Deberías ver logs de `[ConvexProvider]` si está extrayendo el issuer URL

3. **Probar una función de Convex**
   - La aplicación debería cargar datos sin errores
   - Las queries como `userProfiles.getCurrentProfile` deberían funcionar
   - No deberías ver errores en los logs de Convex

### 4. Verificar el Flujo Completo

El flujo de autenticación debería funcionar así:

```
Usuario inicia sesión en Clerk
    ↓
ConvexClientProvider obtiene token de Clerk
    ↓
Token se pasa a Convex via fetchAuthToken
    ↓
Convex verifica token usando CLERK_ISSUER_URL
    ↓
ctx.auth.getUserIdentity() retorna la identidad
    ↓
getClerkUserId() extrae el user ID
    ↓
Queries y mutations funcionan correctamente
```

## 🔍 Verificación en DevTools

### Network Tab
1. Abre DevTools → Network
2. Filtra por "convex"
3. Selecciona una request a Convex
4. Ve a la pestaña "Headers"
5. Deberías ver un header de autorización con el token JWT

### Console Tab
Busca estos mensajes:
- `[ConvexProvider] Extracted issuer URL from token: ...` (opcional, solo si no está configurado)
- NO deberías ver: `[ConvexProvider] Template 'convex' not found` (a menos que no tengas el template configurado en Clerk)

## ⚠️ Problemas Comunes

### Error: "Not authenticated"

**Causas posibles:**
1. Convex no se reinició después de configurar la variable
2. El valor de `CLERK_ISSUER_URL` no coincide exactamente con el de Clerk Dashboard
3. Hay espacios extra o caracteres especiales en la variable

**Solución:**
```bash
# Verificar el valor actual
npx convex env get CLERK_ISSUER_URL

# Si está mal, reconfigurar
npx convex env set CLERK_ISSUER_URL "https://patient-frog-77.clerk.accounts.dev"

# Reiniciar Convex
npx convex dev
```

### Convex no lee la variable

**Causas posibles:**
1. Variable configurada solo en `.env.local` (no funciona para Convex)
2. No se reinició Convex
3. Estás en el proyecto incorrecto de Convex

**Solución:**
- Usa `npx convex env set` (no `.env.local`)
- Reinicia Convex completamente
- Verifica que estás en el proyecto correcto

### Token no se pasa correctamente

**Verificación:**
1. Abre DevTools → Network
2. Busca requests a Convex
3. Verifica que tengan el header de autorización
4. Si no lo tienen, verifica que `ConvexClientProvider` esté funcionando

## ✅ Checklist Final

- [ ] Variable `CLERK_ISSUER_URL` configurada en Convex
- [ ] Convex reiniciado después de configurar la variable
- [ ] No hay warnings en los logs de Convex sobre `CLERK_ISSUER_URL`
- [ ] Puedo iniciar sesión sin errores
- [ ] Las queries de Convex funcionan correctamente
- [ ] No veo errores "Not authenticated" en los logs
- [ ] Las requests a Convex incluyen el header de autorización

## 📝 Comandos Útiles

```bash
# Ver todas las variables de entorno
npx convex env list

# Ver una variable específica
npx convex env get CLERK_ISSUER_URL

# Configurar una variable
npx convex env set CLERK_ISSUER_URL "https://patient-frog-77.clerk.accounts.dev"

# Reiniciar Convex
npx convex dev
```

## 🎯 Resultado Esperado

Una vez completados todos los pasos, deberías poder:
- ✅ Iniciar sesión sin errores
- ✅ Las queries de Convex que requieren autenticación funcionan
- ✅ No hay errores "Not authenticated" en los logs de Convex
- ✅ El flujo de autenticación funciona de extremo a extremo

