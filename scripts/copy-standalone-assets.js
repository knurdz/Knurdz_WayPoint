#!/usr/bin/env node

/**
 * Automates synchronization of static and public assets to Next.js standalone directories.
 * Next.js standalone mode does not automatically copy .next/static or public files,
 * causing 500/404 MIME errors when running standalone servers.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const webDir = path.join(rootDir, 'apps/web');
const nextStatic = path.join(webDir, '.next/static');
const webPublic = path.join(webDir, 'public');

const targets = [
  {
    destStatic: path.join(webDir, '.next/standalone/apps/web/.next/static'),
    destPublic: path.join(webDir, '.next/standalone/apps/web/public'),
  },
  {
    destStatic: path.join(webDir, '.next/standalone/.next/static'),
    destPublic: path.join(webDir, '.next/standalone/public'),
  },
];

console.log('[standalone-assets] Syncing static and public assets for Next.js standalone...');

if (fs.existsSync(nextStatic)) {
  for (const { destStatic } of targets) {
    fs.mkdirSync(path.dirname(destStatic), { recursive: true });
    fs.cpSync(nextStatic, destStatic, { recursive: true, force: true });
    console.log(`[standalone-assets] Copied static assets to: ${destStatic}`);
  }
} else {
  console.warn(`[standalone-assets] Warning: Source static directory does not exist: ${nextStatic}`);
}

if (fs.existsSync(webPublic)) {
  for (const { destPublic } of targets) {
    fs.mkdirSync(path.dirname(destPublic), { recursive: true });
    fs.cpSync(webPublic, destPublic, { recursive: true, force: true });
    console.log(`[standalone-assets] Copied public assets to: ${destPublic}`);
  }
}

console.log('[standalone-assets] Asset synchronization complete.');
