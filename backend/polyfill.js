import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

/**
 * Node.js v25+ removed the deprecated SlowBuffer API.
 * This polyfill restores it for compatibility with older dependencies (like jwa used by jsonwebtoken).
 */
const bufferMod = require('node:buffer');

if (typeof bufferMod.SlowBuffer === 'undefined') {
  bufferMod.SlowBuffer = bufferMod.Buffer;
}

if (typeof bufferMod.Buffer.prototype.equal === 'undefined' && typeof bufferMod.Buffer.prototype.equals === 'function') {
  bufferMod.Buffer.prototype.equal = bufferMod.Buffer.prototype.equals;
}

// Ensure global access as well
if (typeof globalThis.SlowBuffer === 'undefined') {
  globalThis.SlowBuffer = bufferMod.Buffer;
}
