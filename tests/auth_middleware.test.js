// tests/auth_middleware.test.js
// Unit tests for CampusConnect JWT Authentication Middleware
const { describe, it } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const verifyToken = require('../backend/middleware/auth');

describe('Auth Middleware (verifyToken)', () => {
  const secret = 'test-secret-key-12345';
  process.env.JWT_SECRET = secret;

  it('should return 401 if Authorization header is missing', () => {
    const req = { headers: {} };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => { jsonSent = data; }
        };
      }
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    verifyToken(req, res, next);

    assert.strictEqual(statusSent, 401);
    assert.strictEqual(nextCalled, false);
    assert.ok(jsonSent.message.includes('No token provided'));
  });

  it('should return 403 if token is invalid', () => {
    const req = {
      headers: {
        authorization: 'Bearer invalid.bogus.token'
      }
    };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => { jsonSent = data; }
        };
      }
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    verifyToken(req, res, next);

    assert.strictEqual(statusSent, 403);
    assert.strictEqual(nextCalled, false);
    assert.ok(jsonSent.message.includes('Invalid or expired token'));
  });

  it('should pass and attach decoded user to req if token is valid', () => {
    const userPayload = { id: 101, email: 'kunal@test.edu', role: 'student' };
    const token = jwt.sign(userPayload, secret, { expiresIn: '1h' });

    const req = {
      headers: {
        authorization: `Bearer ${token}`
      }
    };
    const res = {
      status: () => ({ json: () => {} })
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    verifyToken(req, res, next);

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.user.id, 101);
    assert.strictEqual(req.user.email, 'kunal@test.edu');
    assert.strictEqual(req.user.role, 'student');
  });
});
