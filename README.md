# Medical Visitor - Sistema de Citas para Visitadores Médicos

Una aplicación web moderna para que visitadores médicos gestionen sus citas, doctores visitados, medicamentos entregados y centros médicos.

## Características

- ✅ Autenticación de usuarios
- ✅ Gestión de doctores (agregar manualmente)
- ✅ Asociación de hasta 2 centros médicos por doctor
- ✅ Registro de visitas con medicamentos entregados
- ✅ Catálogo de medicamentos
- ✅ Dashboard con estadísticas y visitas recientes
- ✅ Interfaz bilingüe (Español/Inglés)
- ✅ Diseño moderno y responsive

## Tecnologías

- **Next.js 16** - Framework React con App Router
- **Convex** - Backend y base de datos
- **Convex Auth** - Autenticación
- **Tailwind CSS** - Estilos
- **TypeScript** - Tipado estático
- **Lucide React** - Iconos

## Configuración

### ⚠️ IMPORTANTE: Configuración de Convex

**Antes de ejecutar la aplicación, debes configurar Convex:**

1. Instala las dependencias:
```bash
npm install
```

2. **Configura Convex (OBLIGATORIO):**
```bash
npx convex dev
```

Este comando:
- Te pedirá iniciar sesión en Convex (o crear una cuenta gratuita)
- Creará un nuevo proyecto Convex
- Generará automáticamente el archivo `.env.local` con tu `NEXT_PUBLIC_CONVEX_URL`
- Generará los archivos necesarios en `convex/_generated/`

**Nota:** Debes mantener `npx convex dev` ejecutándose en una terminal mientras desarrollas.

3. En otra terminal, inicia el servidor de Next.js:
```bash
npm run dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Solución de Problemas

Si ves el error: `Module not found: Can't resolve '@/convex/_generated/api'`

**Solución:** Ejecuta `npx convex dev` para generar los archivos necesarios. El archivo `api.ts` temporal que existe será reemplazado automáticamente.

## Estructura del Proyecto

```
├── app/                    # Páginas de Next.js
│   ├── page.tsx           # Dashboard
│   ├── login/             # Página de login
│   ├── visits/            # Gestión de visitas
│   ├── doctors/           # Gestión de doctores
│   └── medications/       # Gestión de medicamentos
├── components/             # Componentes reutilizables
│   ├── DoctorSelector.tsx
│   ├── VisitCard.tsx
│   ├── MedicationInput.tsx
│   └── ...
├── convex/                # Backend Convex
│   ├── schema.ts          # Esquema de la base de datos
│   ├── auth.ts            # Configuración de autenticación
│   ├── doctors.ts         # Funciones de doctores
│   ├── visits.ts          # Funciones de visitas
│   └── ...
├── contexts/              # Contextos de React
│   └── LanguageContext.tsx
└── locales/              # Traducciones
    ├── es.json
    └── en.json
```

## Uso

1. **Registro/Login**: Crea una cuenta o inicia sesión
2. **Agregar Doctores**: Ve a "Doctores" y agrega nuevos doctores manualmente
3. **Asociar Centros Médicos**: Al crear un doctor, puedes asociar hasta 2 centros médicos
4. **Crear Visitas**: Ve a "Visitas" y crea nuevas visitas seleccionando el doctor (se mostrarán automáticamente sus centros médicos)
5. **Agregar Medicamentos**: En cada visita, puedes agregar múltiples medicamentos con cantidades
6. **Ver Dashboard**: El dashboard muestra estadísticas y visitas recientes

## Próximas Mejoras

- Edición de visitas y doctores existentes
- Filtros y búsqueda avanzada
- Exportación de datos
- Reportes y estadísticas detalladas
- Notificaciones
