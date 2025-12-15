#!/usr/bin/env node

/**
 * Script para configurar JWT_PRIVATE_KEY para Convex Auth
 * 
 * Este script genera una clave JWT segura y te muestra cómo configurarla en Convex.
 */

const crypto = require('crypto');

console.log(`
╔══════════════════════════════════════════════════════════════╗
║     Configuración de JWT_PRIVATE_KEY - Convex Auth          ║
╚══════════════════════════════════════════════════════════════╝

Para que la autenticación funcione correctamente, necesitas configurar
la variable de entorno JWT_PRIVATE_KEY en tu proyecto Convex.

PASO 1: Generar una clave JWT segura
`);

// Generar una clave JWT segura (base64, 32 bytes)
const jwtKey = crypto.randomBytes(32).toString('base64');

console.log(`
Clave JWT generada:
${jwtKey}

PASO 2: Configurar en Convex

Opción A - Usando el CLI de Convex (RECOMENDADO):
   npx convex env set JWT_PRIVATE_KEY "${jwtKey}"

Opción B - Usando el Dashboard de Convex:
   1. Ve a https://dashboard.convex.dev
   2. Selecciona tu proyecto
   3. Ve a Settings > Environment Variables
   4. Agrega una nueva variable:
      - Nombre: JWT_PRIVATE_KEY
      - Valor: ${jwtKey}
   5. Guarda los cambios

PASO 3: Reiniciar el servidor de Convex

Después de configurar la variable, reinicia el servidor:
   npx convex dev

NOTA: Esta clave es única y segura. Guárdala de forma segura.
      No la compartas ni la subas a repositorios públicos.
`);

