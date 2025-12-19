# Guía de Configuración

## Pasos para Configurar el Proyecto

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Clerk

1. **Crear una cuenta en Clerk:**
   - Ve a [https://clerk.com](https://clerk.com) y crea una cuenta
   - Crea un nuevo proyecto

2. **Obtener las API Keys:**
   - En el Dashboard de Clerk, ve a **Settings → API Keys**
   - Copia las siguientes claves:
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`
     - `CLERK_ISSUER_URL` (formato: `https://your-domain.clerk.accounts.dev`)

3. **Configurar variables de entorno:**
   - Crea un archivo `.env.local` en la raíz del proyecto
   - Agrega las siguientes variables:
     ```env
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
     CLERK_SECRET_KEY=sk_test_...
     CLERK_ISSUER_URL=https://your-domain.clerk.accounts.dev
     NEXT_PUBLIC_ROOT_ADMIN_EMAIL=almontefrederick5@gmail.com
     ```

4. **Configurar JWT en Clerk:**
   - En Clerk Dashboard, ve a **JWT Templates**
   - Crea un nuevo template o edita el existente
   - Asegúrate de que `publicMetadata` esté incluido en el token
   - El token debe incluir el campo `role` en `publicMetadata`

### 3. Configurar Convex

Ejecuta el siguiente comando para inicializar Convex:
```bash
npx convex dev
```

Esto:
- Te pedirá que inicies sesión en Convex (o crea una cuenta si no tienes una)
- Creará un nuevo proyecto Convex
- Generará el archivo `.env.local` con tu `NEXT_PUBLIC_CONVEX_URL`
- Iniciará el servidor de desarrollo de Convex

**Importante:** Agrega la variable de entorno de Clerk en Convex Dashboard:
- Ve a tu proyecto en [Convex Dashboard](https://dashboard.convex.dev)
- Settings → Environment Variables
- Agrega: `CLERK_ISSUER_URL` con el valor de tu Clerk Issuer URL

### 4. Resetear la Base de Datos (Opcional)

Si estás migrando desde Convex Auth o necesitas empezar desde cero:

```bash
# Detener npx convex dev (Ctrl+C)
# Eliminar datos locales (opcional, solo para desarrollo)
# Reiniciar con: npx convex dev
```

**Nota:** Al resetear, perderás todos los datos existentes. Esto es solo para desarrollo.

### 5. Iniciar el Servidor de Desarrollo

En una terminal separada, ejecuta:
```bash
npm run dev
```

Esto iniciará el servidor de Next.js en [http://localhost:3000](http://localhost:3000)

### 6. Primera Ejecución y Promoción a Admin

1. Abre [http://localhost:3000](http://localhost:3000)
2. Serás redirigido a `/login`
3. Crea una cuenta con email y contraseña usando Clerk
4. Una vez autenticado, serás redirigido al dashboard (como visitador)
5. **Para promoverse a admin:**
   - Ve a `/force-admin`
   - Solo funciona si tu email coincide con `NEXT_PUBLIC_ROOT_ADMIN_EMAIL`
   - Haz clic en "Hacerme Admin"
   - Serás redirigido a `/admin` automáticamente

## Estructura de la Base de Datos

La aplicación crea automáticamente las siguientes tablas en Convex:

- **doctors**: Doctores visitados
- **medicalCenters**: Centros médicos
- **visits**: Registro de visitas
- **medications**: Catálogo de medicamentos
- **userProfiles**: Perfiles de usuario (vinculados a Clerk user IDs)
- **activityLogs**: Registro de actividades

**Nota:** Los usuarios ahora se gestionan en Clerk, no en Convex. El `userId` en las tablas es el Clerk user ID (string).

## Sistema de Roles

- **Admin**: Acceso completo a `/admin` y todas las funcionalidades
- **Visitor**: Acceso limitado al dashboard principal (`/`)

Los roles se almacenan en Clerk `publicMetadata.role` y se sincronizan con `userProfiles.role` en Convex.

## Uso de la Aplicación

### Agregar un Doctor
1. Ve a "Doctores" en el menú
2. Haz clic en "Nuevo Doctor"
3. Completa el formulario
4. Puedes asociar hasta 2 centros médicos (crear nuevos o seleccionar existentes)

### Crear una Visita
1. Ve a "Visitas" en el menú
2. Haz clic en "Nueva Visita"
3. Selecciona un doctor (se mostrarán automáticamente sus centros médicos)
4. Agrega la fecha y estado
5. Agrega medicamentos entregados
6. Guarda la visita

### Gestionar Medicamentos
1. Ve a "Medicamentos" en el menú
2. Haz clic en "Nuevo Medicamento"
3. Completa el formulario con nombre, descripción y unidad
4. Los medicamentos estarán disponibles al crear visitas

## Notas Importantes

- Cada usuario solo ve sus propios datos (doctores, visitas, medicamentos) a menos que sea admin
- Los admins pueden ver y gestionar todos los datos
- Los doctores pueden tener máximo 2 centros médicos asociados
- El idioma se puede cambiar usando el botón en la esquina superior derecha
- Todas las fechas se guardan como timestamps Unix

## Solución de Problemas

### Error: "Missing NEXT_PUBLIC_CONVEX_URL"
- Asegúrate de haber ejecutado `npx convex dev` primero
- Verifica que el archivo `.env.local` existe y contiene `NEXT_PUBLIC_CONVEX_URL`

### Error: "Missing Clerk keys"
- Verifica que `.env.local` contiene `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY`
- Reinicia el servidor de Next.js después de agregar las variables

### Error de Autenticación en Convex
- Asegúrate de que `CLERK_ISSUER_URL` esté configurada en Convex Dashboard
- Verifica que el archivo `convex/auth.config.ts` existe
- Asegúrate de que el servidor de Convex esté corriendo (`npx convex dev`)

### Los datos no aparecen
- Verifica que estés autenticado con Clerk
- Asegúrate de que el servidor de Convex esté corriendo
- Revisa la consola del navegador para errores
- Verifica que tu perfil de usuario exista en Convex (se crea automáticamente al iniciar sesión)

### No puedo acceder a `/admin`
- Verifica que tu rol en Clerk sea "admin" (ve a `/force-admin` si eres el email raíz)
- Revisa que `publicMetadata.role` esté configurado en Clerk
- Limpia el caché del navegador y recarga
