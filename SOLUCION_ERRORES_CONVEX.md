# Solución a Errores de Convex con Clerk

## Errores Comunes y Soluciones

### 1. Error: "Unable to start push to http://127.0.0.1:3210"

**Causa:** Problemas con la configuración de autenticación o módulos de Convex.

**Solución:**
1. Verifica que `convex/auth.config.ts` existe y está configurado correctamente
2. Asegúrate de que `CLERK_ISSUER_URL` esté configurada en Convex Dashboard
3. Actualiza Convex a la última versión: `npm install convex@latest`
4. Reinicia `npx convex dev`

### 2. Error: "Function execution timed out"

**Causa:** Queries o mutations que toman demasiado tiempo.

**Solución:**
- Ya implementado: Las queries usan `.take()` en lugar de `.collect()`
- Las operaciones se procesan en lotes
- Si persiste, reduce los límites en las queries

### 3. Error: "Not authenticated" en Convex

**Causa:** Convex no puede validar el token de Clerk.

**Solución:**
1. Verifica que `CLERK_ISSUER_URL` esté configurada en Convex Dashboard
2. Verifica que `convex/auth.config.ts` existe
3. Asegúrate de que el token de Clerk incluya `publicMetadata`
4. Reinicia `npx convex dev`

### 4. Error: "ctx.auth.getUserIdentity() returns null"

**Causa:** El token de Clerk no se está pasando correctamente a Convex.

**Solución:**
1. Verifica que estés autenticado en Clerk (revisa la sesión en el navegador)
2. Asegúrate de que `ConvexProvider` esté configurado correctamente
3. Verifica que `CLERK_ISSUER_URL` esté configurada en Convex
4. Revisa la consola del navegador para errores de autenticación

### 5. Error: "User profile not found"

**Causa:** El perfil de usuario no existe en Convex.

**Solución:**
- El perfil se crea automáticamente al iniciar sesión
- Si no se crea, llama manualmente a `userProfiles.ensureForCurrentUser`
- Verifica que el `userId` (Clerk user ID) sea correcto

## Pasos de Limpieza y Reinicio

Si experimentas problemas persistentes:

### Paso 1: Detener todos los procesos
```bash
# Detén npx convex dev (Ctrl+C)
# Detén npm run dev (Ctrl+C)
```

### Paso 2: Limpiar caché
```powershell
# Windows PowerShell
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules\.cache
```

### Paso 3: Verificar variables de entorno
Asegúrate de que `.env.local` contiene:
```env
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_ISSUER_URL=https://your-domain.clerk.accounts.dev
NEXT_PUBLIC_ROOT_ADMIN_EMAIL=almontefrederick5@gmail.com
```

### Paso 4: Reiniciar Convex PRIMERO
```bash
npx convex dev
```

Espera a ver:
```
✔ Convex functions ready!
```

### Paso 5: Reiniciar Next.js
En una nueva terminal:
```bash
npm run dev
```

### Paso 6: Limpiar almacenamiento del navegador
1. Abre DevTools (F12)
2. Ve a Application → Local Storage
3. Limpia todo el almacenamiento local
4. También limpia Session Storage
5. Recarga la página (F5)

## Verificación Final

Después de seguir todos los pasos, deberías poder:
- ✅ Ver la página de login sin errores
- ✅ Iniciar sesión con Clerk
- ✅ Ser redirigido según tu rol (admin → `/admin`, visitor → `/`)
- ✅ Ver tus datos en el dashboard
- ✅ Acceder a `/admin` si eres admin

## Notas Importantes

- **Siempre inicia Convex ANTES que Next.js**
- **No cierres la terminal de Convex** mientras uses la aplicación
- **Si cambias código en `convex/`, Convex se recargará automáticamente**
- **Si cambias código en `app/` o componentes, Next.js se recargará automáticamente**
- **Los roles se gestionan en Clerk, no en Convex directamente**
