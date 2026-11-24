// tests/api_health.test.js
// Unit tests for Core App Route Handlers and Environment Configurations
const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('CampusConnect Application Core Routing', () => {
  it('should load express application without unhandled errors', () => {
    process.env.NODE_ENV = 'test';
    const app = require('../backend/server');
    assert.ok(app);
    assert.strictEqual(typeof app.handle, 'function');
  });

  it('should have health check and root routes registered on the router', () => {
    process.env.NODE_ENV = 'test';
    const app = require('../backend/server');
    const stack = app.router?.stack || app._router?.stack || [];
    const routes = stack.filter(layer => layer.route).map(layer => layer.route.path);

    assert.ok(routes.includes('/'), 'Root "/" route must be registered');
    assert.ok(routes.includes('/api/health'), 'Health check "/api/health" route must be registered');
  });
});
