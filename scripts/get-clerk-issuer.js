#!/usr/bin/env node

/**
 * Script para obtener el CLERK_ISSUER_URL automáticamente
 * 
 * Este script intenta obtener el issuer URL desde:
 * 1. Variables de entorno de Clerk
 * 2. El token JWT de Clerk (si está disponible)
 * 3. Solicita al usuario que lo ingrese manualmente
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getIssuerFromEnv() {
  // Intentar obtener desde .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/CLERK_ISSUER_URL\s*=\s*(.+)/);
    if (match && match[1].trim() && !match[1].trim().startsWith('#')) {
      const issuer = match[1].trim();
      if (issuer && issuer !== '""' && issuer !== "''") {
        return issuer;
      }
    }
  }
  return null;
}

function extractIssuerFromPublishableKey(publishableKey) {
  // Los publishable keys de Clerk tienen el formato: pk_test_xxxxx o pk_live_xxxxx
  // El issuer URL generalmente es: https://[domain].clerk.accounts.dev
  // Pero no podemos derivarlo directamente del publishable key
  // Necesitamos que el usuario lo proporcione
  return null;
}

console.log(`
╔══════════════════════════════════════════════════════════════╗
║     Configuración Automática de CLERK_ISSUER_URL            ║
╚══════════════════════════════════════════════════════════════╝

Este script configurará CLERK_ISSUER_URL en Convex para que la
autenticación funcione correctamente.

`);

// Intentar obtener desde .env.local
const existingIssuer = getIssuerFromEnv();
if (existingIssuer && existingIssuer !== '""' && existingIssuer !== "''") {
  console.log(`✅ CLERK_ISSUER_URL encontrado en .env.local: ${existingIssuer}`);
  console.log(`\nConfigurando en Convex...\n`);
  
  try {
    execSync(`npx convex env set CLERK_ISSUER_URL "${existingIssuer}"`, {
      stdio: 'inherit',
      shell: true
    });
    console.log('\n✅ CLERK_ISSUER_URL configurado exitosamente en Convex!');
    console.log('\n⚠️  IMPORTANTE: Reinicia el servidor de Convex (npx convex dev) para aplicar los cambios.\n');
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al configurar CLERK_ISSUER_URL:', error.message);
    console.log('\nPor favor, configúralo manualmente en:');
    console.log('https://dashboard.convex.dev > Tu Proyecto > Settings > Environment Variables\n');
    rl.close();
    process.exit(1);
  }
}

// Si no se encontró, solicitar al usuario
console.log(`
PASO 1: Obtén tu Clerk Issuer URL

1. Ve a tu Dashboard de Clerk: https://dashboard.clerk.com
2. Selecciona tu aplicación.
3. Navega a "Settings" → "API Keys".
4. Copia el valor de "Issuer URL".
   Debería tener un formato similar a: https://your-domain.clerk.accounts.dev

`);

rl.question('Por favor, pega tu CLERK_ISSUER_URL aquí: ', (issuerUrl) => {
  const trimmedUrl = issuerUrl.trim();

  if (!trimmedUrl) {
    console.error('❌ La URL no puede estar vacía. Por favor, inténtalo de nuevo.');
    rl.close();
    process.exit(1);
  }

  // Validación básica del formato
  if (!trimmedUrl.startsWith('https://') || !trimmedUrl.includes('.clerk.accounts.dev')) {
    console.error('❌ Formato de CLERK_ISSUER_URL inválido.');
    console.error('   Debe empezar con "https://" y contener ".clerk.accounts.dev".');
    console.error('   Ejemplo: https://your-domain.clerk.accounts.dev');
    rl.close();
    process.exit(1);
  }

  // Actualizar .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Actualizar o agregar CLERK_ISSUER_URL
  if (envContent.includes('CLERK_ISSUER_URL=')) {
    envContent = envContent.replace(
      /CLERK_ISSUER_URL\s*=.*/,
      `CLERK_ISSUER_URL=${trimmedUrl}`
    );
  } else {
    envContent += `\nCLERK_ISSUER_URL=${trimmedUrl}\n`;
  }

  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log(`\n✅ CLERK_ISSUER_URL actualizado en .env.local`);

  // Configurar en Convex
  console.log(`\nConfigurando CLERK_ISSUER_URL en Convex: ${trimmedUrl}`);

  try {
    execSync(`npx convex env set CLERK_ISSUER_URL "${trimmedUrl}"`, {
      stdio: 'inherit',
      shell: true
    });

    console.log('\n✅ CLERK_ISSUER_URL configurado exitosamente en Convex!');
    console.log('\n⚠️  IMPORTANTE: Reinicia el servidor de Convex (npx convex dev) para aplicar los cambios.\n');
  } catch (error) {
    console.error('\n❌ Error al configurar CLERK_ISSUER_URL:', error.message);
    console.log('\nPor favor, configúralo manualmente en:');
    console.log('https://dashboard.convex.dev > Tu Proyecto > Settings > Environment Variables\n');
  } finally {
    rl.close();
  }
});

