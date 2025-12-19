#!/usr/bin/env node

/**
 * Script para configurar CLERK_ISSUER_URL en Convex
 * 
 * Este script te ayuda a configurar la variable de entorno CLERK_ISSUER_URL
 * que Convex necesita para verificar los tokens de autenticación de Clerk.
 * 
 * Uso:
 *   node scripts/setup-clerk-issuer.js
 *   O simplemente sigue las instrucciones que se muestran
 */

const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(`
╔══════════════════════════════════════════════════════════════╗
║     Configuración de CLERK_ISSUER_URL para Convex           ║
╚══════════════════════════════════════════════════════════════╝

Este script te ayudará a configurar CLERK_ISSUER_URL en Convex.

PASO 1: Obtén tu Clerk Issuer URL
───────────────────────────────────────────────────────────────
1. Ve a https://dashboard.clerk.com
2. Selecciona tu aplicación
3. Ve a Settings → API Keys
4. Busca "Issuer URL" (formato: https://your-domain.clerk.accounts.dev)
5. Copia ese valor

PASO 2: Configuración
───────────────────────────────────────────────────────────────
`);

rl.question('Ingresa tu Clerk Issuer URL (o presiona Enter para salir): ', (issuerUrl) => {
  if (!issuerUrl || issuerUrl.trim() === '') {
    console.log('\n❌ Operación cancelada.');
    rl.close();
    return;
  }

  const trimmedUrl = issuerUrl.trim();
  
  // Validar formato básico
  if (!trimmedUrl.startsWith('https://') || !trimmedUrl.includes('.clerk.accounts.dev')) {
    console.log('\n⚠️  Advertencia: El formato no parece correcto.');
    console.log('   Debería ser: https://your-domain.clerk.accounts.dev');
    console.log('   Continuando de todas formas...\n');
  }

  try {
    console.log(`\n📝 Configurando CLERK_ISSUER_URL en Convex...`);
    console.log(`   Valor: ${trimmedUrl}\n`);
    
    // Configurar usando convex env set
    execSync(`npx convex env set CLERK_ISSUER_URL "${trimmedUrl}"`, {
      stdio: 'inherit',
      shell: true
    });
    
    console.log('\n✅ ¡CLERK_ISSUER_URL configurado exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Reinicia el servidor de Convex (Ctrl+C y luego: npx convex dev)');
    console.log('   2. Prueba iniciar sesión nuevamente');
    console.log('   3. El error "Not authenticated" debería estar resuelto\n');
    
  } catch (error) {
    console.error('\n❌ Error al configurar CLERK_ISSUER_URL:', error.message);
    console.log('\n📝 Configuración manual:');
    console.log('   1. Ejecuta manualmente:');
    console.log(`      npx convex env set CLERK_ISSUER_URL "${trimmedUrl}"`);
    console.log('   2. O configura en Convex Dashboard:');
    console.log('      https://dashboard.convex.dev → Tu Proyecto → Settings → Environment Variables');
    console.log(`      Nombre: CLERK_ISSUER_URL`);
    console.log(`      Valor: ${trimmedUrl}\n`);
  }
  
  rl.close();
});

