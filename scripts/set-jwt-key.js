#!/usr/bin/env node

const { execSync } = require('child_process');
const crypto = require('crypto');

// Generar clave RSA privada en formato PKCS#8
const { privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  },
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  }
});

console.log('Generando clave RSA privada en formato PKCS#8...\n');
console.log('Clave generada. Configurando en Convex...\n');

try {
  const fs = require('fs');
  const path = require('path');
  
  // Guardar la clave en un archivo temporal
  const tempFile = path.join(process.cwd(), 'temp_jwt_key.txt');
  fs.writeFileSync(tempFile, privateKey);
  
  // Configurar usando convex env set con el archivo
  const isWindows = process.platform === 'win32';
  let command;
  
  if (isWindows) {
    // Windows PowerShell
    command = `Get-Content temp_jwt_key.txt | npx convex env set JWT_PRIVATE_KEY`;
  } else {
    // Unix/Linux/Mac
    command = `cat temp_jwt_key.txt | npx convex env set JWT_PRIVATE_KEY`;
  }
  
  execSync(command, {
    stdio: 'inherit',
    shell: true
  });
  
  // Limpiar archivo temporal
  fs.unlinkSync(tempFile);
  
  console.log('\n✅ Clave JWT_PRIVATE_KEY configurada exitosamente!');
  console.log('\n⚠️  IMPORTANTE: Reinicia el servidor de Convex (npx convex dev) para aplicar los cambios.\n');
} catch (error) {
  console.error('\n❌ Error al configurar la clave:', error.message);
  console.log('\nClave generada (cópiala manualmente):\n');
  console.log(privateKey);
  console.log('\nPara configurarla manualmente, ve a:');
  console.log('https://dashboard.convex.dev > Tu Proyecto > Settings > Environment Variables\n');
}

