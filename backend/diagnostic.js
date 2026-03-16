import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const bufferMod = require('node:buffer');
if (typeof bufferMod.SlowBuffer === 'undefined') {
  bufferMod.SlowBuffer = bufferMod.Buffer;
}

if (typeof bufferMod.Buffer.prototype.equal === 'undefined') {
  bufferMod.Buffer.prototype.equal = bufferMod.Buffer.prototype.equals;
}

// Also set global as fallback
globalThis.SlowBuffer = bufferMod.Buffer;

console.log('--- Diagnostic 2 ---');
console.log('require("buffer").SlowBuffer exists:', typeof require('buffer').SlowBuffer !== 'undefined');

try {
  const jwa = require('jwa');
  console.log('✅ jwa loaded successfully');
} catch (e) {
  console.error('❌ jwa load failed:', e.message);
}
