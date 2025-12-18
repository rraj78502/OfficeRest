#!/usr/bin/env node

/**
 * Small utility to figure out which IP the OTP SOAP requests target and
 * verify whether it is reachable from the current machine.
 *
 * Usage:
 *   cd backend
 *   node scripts/check-otp-endpoint.js
 */

const { spawn } = require('child_process');
const dns = require('dns').promises;
const path = require('path');
const fs = require('fs');

// Load backend/.env so we get NTC_WSDL_URL even when node_modules have not been installed
const envPath = path.resolve(__dirname, '..', '.env');
const dotenvLoaded = (() => {
  try {
    const dotenv = require('dotenv');
    dotenv.config({ path: fs.existsSync(envPath) ? envPath : undefined });
    return true;
  } catch (err) {
    return false;
  }
})();

if (!dotenvLoaded && fs.existsSync(envPath)) {
  // Lightweight parser that only handles KEY=VALUE per line
  const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of envLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const idx = trimmed.indexOf('=');
    if (idx === -1) {
      continue;
    }
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
      process.env[key] = value;
    }
  }
}

const wsdlUrl = process.env.NTC_WSDL_URL;

if (!wsdlUrl) {
  console.error('✗ NTC_WSDL_URL is not defined. Please set it in backend/.env.');
  process.exit(1);
}

let targetHost;
try {
  targetHost = new URL(wsdlUrl).hostname;
} catch (err) {
  console.error(`✗ Failed to parse NTC_WSDL_URL (${wsdlUrl}):`, err.message);
  process.exit(1);
}

async function resolveTarget(host) {
  try {
    const result = await dns.lookup(host);
    return result.address;
  } catch (err) {
    console.warn(`⚠ Could not resolve ${host} via DNS (${err.message}). Using hostname directly.`);
    return host;
  }
}

async function runPing(target) {
  return new Promise((resolve) => {
    const pingArgs = process.platform === 'win32' ? ['-n', '4', target] : ['-c', '4', target];
    console.log(`\n↪ Running ping ${pingArgs.join(' ')}`);

    const ping = spawn('ping', pingArgs, { stdio: 'inherit' });
    ping.on('close', (code) => resolve(code === 0));
  });
}

async function main() {
  console.log('OTP SOAP endpoint:', wsdlUrl);
  console.log('Extracted host:', targetHost);

  const resolvedIp = await resolveTarget(targetHost);
  console.log('Resolved IP:', resolvedIp);

  const pingOk = await runPing(resolvedIp);
  if (pingOk) {
    console.log('\n✓ Endpoint IP is reachable via ping');
    process.exit(0);
  } else {
    console.error('\n✗ Endpoint IP is NOT reachable via ping');
    process.exit(2);
  }
}

main().catch((err) => {
  console.error('\n✗ Unexpected error while testing OTP endpoint connectivity:', err);
  process.exit(1);
});
