import jwt from 'jsonwebtoken';
import 'dotenv/config';

const secret = process.env.JWT_SECRET;
console.log('JWT_SECRET:', secret);

if (!secret) {
    console.error('JWT_SECRET is not defined!');
    process.exit(1);
}

const payload = { id: 'test', role: 'admin' };
const token = jwt.sign(payload, secret, { expiresIn: '1d' });
console.log('Generated token:', token);

try {
    const decoded = jwt.verify(token, secret);
    console.log('Decoded token:', decoded);
    console.log('Verification successful!');
} catch (err) {
    console.error('Verification failed:', err.message);
}
