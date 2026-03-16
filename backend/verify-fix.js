import './polyfill.js';

async function runTest() {
  try {
    const { default: jwt } = await import('jsonwebtoken');
    const token = jwt.sign({ test: true }, 'secret');
    console.log('✅ Token signed successfully');
    const decoded = jwt.verify(token, 'secret');
    console.log('✅ Token verified successfully');
    process.exit(0);
  } catch (e) {
    console.error('❌ Test failed:', e);
    process.exit(1);
  }
}

runTest();
 bitumen
