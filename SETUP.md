# Guía de Configuración

## Pasos para Configurar el Proyecto

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Convex

Ejecuta el siguiente comando para inicializar Convex:
```bash
npx convex dev
```

Esto:
- Te pedirá que inicies sesión en Convex (o crea una cuenta si no tienes una)
- Creará un nuevo proyecto Convex
- Generará el archivo `.env.local` con tu `NEXT_PUBLIC_CONVEX_URL`
- Iniciará el servidor de desarrollo de Convex

### 3. Iniciar el Servidor de Desarrollo

En una terminal separada, ejecuta:
```bash
npm run dev
```

Esto iniciará el servidor de Next.js en [http://localhost:3000](http://localhost:3000)

### 4. Primera Ejecución

1. Abre [http://localhost:3000](http://localhost:3000)
2. Serás redirigido a `/login`
3. Crea una cuenta con email y contraseña
4. Una vez autenticado, serás redirigido al dashboard

## Estructura de la Base de Datos

La aplicación crea automáticamente las siguientes tablas en Convex:

- **users**: Usuarios autenticados (manejado por Convex Auth)
- **doctors**: Doctores visitados
- **medicalCenters**: Centros médicos
- **visits**: Registro de visitas
- **medications**: Catálogo de medicamentos

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

- Cada usuario solo ve sus propios datos (doctores, visitas, medicamentos)
- Los doctores pueden tener máximo 2 centros médicos asociados
- El idioma se puede cambiar usando el botón en la esquina superior derecha
- Todas las fechas se guardan como timestamps Unix

## Solución de Problemas

### Error: "Missing NEXT_PUBLIC_CONVEX_URL"
- Asegúrate de haber ejecutado `npx convex dev` primero
- Verifica que el archivo `.env.local` existe y contiene `NEXT_PUBLIC_CONVEX_URL`

### Error de Autenticación
- Asegúrate de que el servidor de Convex esté corriendo (`npx convex dev`)
- Verifica que el esquema de la base de datos esté actualizado

### Los datos no aparecen
- Verifica que estés autenticado
- Asegúrate de que el servidor de Convex esté corriendo
- Revisa la consola del navegador para errores

