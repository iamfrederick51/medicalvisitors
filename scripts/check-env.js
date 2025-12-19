#!/usr/bin/env node

/**
 * Script para verificar la configuración de variables de entorno
 */

const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(process.cwd(), '.env.local');

console.log('\n🔍 Verificando configuración de Convex...\n');

if (!fs.existsSync(envLocalPath)) {
  console.log('❌ No se encontró el archivo .env.local\n');
  console.log('📝 Para solucionarlo:\n');
  console.log('   1. Ejecuta: npx convex dev');
  console.log('   2. Esto creará automáticamente el archivo .env.local\n');
  process.exit(1);
}

const envContent = fs.readFileSync(envLocalPath, 'utf8');
const hasConvexUrl = envContent.includes('NEXT_PUBLIC_CONVEX_URL');

if (!hasConvexUrl || !envContent.match(/NEXT_PUBLIC_CONVEX_URL\s*=\s*.+/)) {
  console.log('⚠️  El archivo .env.local existe pero NEXT_PUBLIC_CONVEX_URL no está configurado\n');
  console.log('📝 Para solucionarlo:\n');
  console.log('   1. Ejecuta: npx convex dev');
  console.log('   2. Esto actualizará el archivo .env.local con tu URL de Convex\n');
  console.log('   Nota: En local, la URL correcta suele ser http://127.0.0.1:3210 (6790 es el dashboard)\n');
  process.exit(1);
}

console.log('✅ Configuración de Convex encontrada\n');
process.exit(0);

