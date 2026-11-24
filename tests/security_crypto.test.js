// tests/security_crypto.test.js
// Unit tests for Password Hashing & Crypto validation in CampusConnect
const { describe, it } = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Security & Cryptography Utilities', () => {
  it('should hash plain password securely and verify matching password', async () => {
    const rawPassword = 'SecureStudentPassword2026!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    assert.notStrictEqual(rawPassword, hashedPassword);
    assert.strictEqual(hashedPassword.startsWith('$2'), true); // bcrypt hash format

    const isMatch = await bcrypt.compare(rawPassword, hashedPassword);
    assert.strictEqual(isMatch, true);

    const isWrongMatch = await bcrypt.compare('WrongPassword123', hashedPassword);
    assert.strictEqual(isWrongMatch, false);
  });

  it('should sign and verify JWT tokens with proper claims', () => {
    const secret = 'campusconnect-ci-secret';
    const payload = {
      id: 42,
      email: 'recruiter@google.com',
      role: 'recruiter'
    };

    const token = jwt.sign(payload, secret, { expiresIn: '2h' });
    assert.strictEqual(typeof token, 'string');
    assert.strictEqual(token.split('.').length, 3); // Header.Payload.Signature

    const decoded = jwt.verify(token, secret);
    assert.strictEqual(decoded.id, 42);
    assert.strictEqual(decoded.email, 'recruiter@google.com');
    assert.strictEqual(decoded.role, 'recruiter');
    assert.ok(decoded.exp > decoded.iat);
  });

  it('should reject tampered JWT tokens', () => {
    const secret = 'campusconnect-ci-secret';
    const token = jwt.sign({ id: 1, role: 'student' }, secret);
    const tamperedToken = token.slice(0, -5) + 'xxxxx';

    assert.throws(() => {
      jwt.verify(tamperedToken, secret);
    }, /invalid signature/i);
  });
});
