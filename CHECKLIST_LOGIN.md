# Checklist: ¿Qué hace falta para que funcione el login?

## ✅ Verificaciones Necesarias

### 1. **Convex debe estar corriendo**
```bash
# En una terminal, ejecuta:
npx convex dev
```

**Verifica que:**
- El API de Convex esté corriendo en el puerto 3210 (el dashboard local es 6790)
- No haya errores en la terminal
- Veas mensajes como "Convex functions are ready" o similar

### 2. **Archivo `.env.local` debe existir y tener la URL correcta**
```bash
# Verifica que existe:
cat .env.local
```

**Debe contener:**
```
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
```

### 3. **Archivo `convex.json` debe existir**
```json
{
  "functions": "convex/"
}
```

### 4. **Next.js debe estar corriendo**
```bash
# En otra terminal (diferente a la de Convex), ejecuta:
npm run dev
```

**Verifica que:**
- El servidor esté corriendo en http://localhost:3000
- No haya errores de compilación

### 5. **Variables de entorno de Convex (si usas producción)**

Si estás usando Convex en producción (no local), necesitas configurar:
- `JWT_PRIVATE_KEY` en el dashboard de Convex (Settings → Environment Variables)

**Para desarrollo local, esto NO es necesario.**

## 🔍 Diagnóstico de Problemas

### Si el login se queda cargando:

1. **Abre la consola del navegador (F12)**
   - Busca errores en la pestaña "Console"
   - Busca errores en la pestaña "Network"

2. **Verifica que Convex esté respondiendo:**
   - En la consola del navegador, busca llamadas a `http://127.0.0.1:3210`
   - Deben responder con código 200 (éxito)

3. **Verifica los logs de Convex:**
   - En la terminal donde corre `npx convex dev`
   - Busca errores relacionados con `auth` o `signIn`

### Errores Comunes:

#### Error: "Cannot connect to Convex"
- **Solución:** Asegúrate de que `npx convex dev` esté corriendo
- Verifica que el puerto 3210 no esté bloqueado (6790 es el dashboard)

#### Error: "NEXT_PUBLIC_CONVEX_URL is not defined"
- **Solución:** Verifica que `.env.local` existe y tiene la variable correcta
- Reinicia el servidor de Next.js después de crear/modificar `.env.local`

#### Error: "Invalid credentials" o "User not found"
- **Solución:** 
  - Si es la primera vez, usa "Registrarse" en lugar de "Iniciar Sesión"
  - Verifica que el email y contraseña sean correctos

#### El login se queda en "Autenticando..." indefinidamente
- **Solución:** 
  - Verifica que Convex esté corriendo
  - Revisa la consola del navegador para errores
  - Verifica que `currentUser` query esté funcionando

## 📝 Pasos para Probar el Login

1. **Abre http://localhost:3000/login**

2. **Si es la primera vez:**
   - Haz clic en "¿No tienes cuenta? Regístrate"
   - Ingresa un email y contraseña
   - Haz clic en "Registrarse"
   - Deberías ser redirigido al dashboard

3. **Si ya tienes cuenta:**
   - Ingresa tu email y contraseña
   - Haz clic en "Iniciar Sesión"
   - Deberías ser redirigido al dashboard

## 🚨 Si Nada Funciona

1. **Detén todos los servidores** (Ctrl+C en ambas terminales)

2. **Limpia la caché de Next.js:**
   ```bash
   rm -rf .next
   # O en Windows PowerShell:
   Remove-Item -Recurse -Force .next
   ```

3. **Reinicia todo:**
   ```bash
   # Terminal 1:
   npx convex dev
   
   # Terminal 2:
   npm run dev
   ```

4. **Limpia el localStorage del navegador:**
   - Abre las herramientas de desarrollador (F12)
   - Ve a "Application" → "Local Storage"
   - Limpia todo el localStorage para localhost:3000

5. **Intenta de nuevo**

