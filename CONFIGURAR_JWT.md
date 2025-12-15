# ⚠️ CONFIGURACIÓN URGENTE: JWT_PRIVATE_KEY

## Problema
El error `"pkcs8" must be PKCS#8 formatted string` indica que la clave JWT no está en el formato correcto.

## Solución: Configurar en el Dashboard de Convex

### Paso 1: Obtener la clave
Ejecuta este comando para generar una clave válida:

```bash
node -e "const crypto = require('crypto'); const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } }); console.log(privateKey);"
```

### Paso 2: Configurar en Convex Dashboard

1. **Ve a:** https://dashboard.convex.dev
2. **Selecciona tu proyecto**
3. **Ve a:** Settings (Configuración) → Environment Variables (Variables de Entorno)
4. **Busca la variable:** `JWT_PRIVATE_KEY`
   - Si existe, **ELIMÍNALA** primero
5. **Haz clic en:** "Add Variable" o "Agregar Variable"
6. **Nombre:** `JWT_PRIVATE_KEY`
7. **Valor:** Pega la clave completa generada en el Paso 1 (debe incluir `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`)
8. **Guarda los cambios**

### Paso 3: Reiniciar Convex

Después de configurar la variable:

1. **Detén** el servidor de Convex (Ctrl+C si está corriendo)
2. **Reinicia** con: `npx convex dev`

### Paso 4: Probar

Intenta registrarte o iniciar sesión nuevamente. El error debería estar resuelto.

---

## Nota Importante

- La clave debe estar en formato **PKCS#8 PEM**
- Debe incluir las líneas `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`
- No uses la clave anterior (la que estaba en base64)
- Esta clave es única y segura - no la compartas

