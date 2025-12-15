#!/usr/bin/env node

/**
 * Script de ayuda para configurar Convex
 * 
 * Este script te guiará en el proceso de configuración de Convex.
 * 
 * Para usar:
 * 1. Ejecuta: node scripts/setup-convex.js
 * 2. O mejor aún, ejecuta directamente: npx convex dev
 */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║          Configuración de Convex - Medical Visitor          ║
╚══════════════════════════════════════════════════════════════╝

Para configurar Convex correctamente, sigue estos pasos:

1. Ejecuta el siguiente comando en tu terminal:
   
   npx convex dev

2. Esto te pedirá:
   - Iniciar sesión en Convex (o crear una cuenta)
   - Crear un nuevo proyecto o seleccionar uno existente
   - Generará automáticamente el archivo .env.local

3. Una vez configurado, Convex generará los archivos necesarios en:
   - convex/_generated/api.ts
   - convex/_generated/dataModel.d.ts
   - convex/_generated/server.d.ts

4. El servidor de desarrollo de Convex se ejecutará automáticamente.

NOTA: El archivo api.ts que existe actualmente es temporal y será 
reemplazado cuando ejecutes 'npx convex dev'.

Para más información, visita: https://docs.convex.dev/quickstart/nextjs
`);

