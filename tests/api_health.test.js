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
    assert.ok(routes.includes('/metrics'), 'Prometheus "/metrics" route must be registered');
  });

  it('should expose valid Prometheus metrics exposition text from metricsHandler', async () => {
    const { metricsHandler } = require('../backend/middleware/metrics');
    let contentType = '';
    let body = '';

    await metricsHandler({}, {
      set: (k, v) => { if (k.toLowerCase() === 'content-type') contentType = v; },
      end: (text) => { body = text; },
      status: () => ({ end: (text) => { body = text; } })
    });

    assert.ok(contentType.includes('text/plain'), 'Metrics Content-Type must be text/plain');
    assert.ok(body.includes('campusconnect_http_requests_total'), 'Custom HTTP counter must be present');
    assert.ok(body.includes('campusconnect_http_request_duration_seconds'), 'Latency histogram must be present');
  });
});
