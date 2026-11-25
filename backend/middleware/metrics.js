// middleware/metrics.js — Prometheus Instrumentation Middleware & /metrics Endpoint
const client = require('prom-client');

const register = new client.Registry();

// Collect default Node.js runtime metrics (CPU, Heap RAM, Event Loop lag, GC)
client.collectDefaultMetrics({
  register,
  prefix: 'campusconnect_'
});

// Custom Counter: Total HTTP requests partitioned by method, route, and status
const httpRequestsTotal = new client.Counter({
  name: 'campusconnect_http_requests_total',
  help: 'Total count of HTTP requests handled by CampusConnect API',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Custom Histogram: API response latency buckets (seconds) for P50/P95/P99
const httpRequestDurationSeconds = new client.Histogram({
  name: 'campusconnect_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register]
});

/**
 * Express middleware capturing request throughput and response latency.
 */
function metricsMiddleware(req, res, next) {
  if (req.path === '/metrics') {
    return next();
  }

  const endTimer = httpRequestDurationSeconds.startTimer();

  res.on('finish', () => {
    const routePath = req.route?.path ? `${req.baseUrl}${req.route.path}` : req.path;
    const labels = {
      method: req.method,
      route: routePath,
      status_code: String(res.statusCode)
    };
    httpRequestsTotal.inc(labels);
    endTimer(labels);
  });

  next();
}

/**
 * Route handler returning Prometheus exposition format metrics.
 */
async function metricsHandler(req, res) {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
}

module.exports = {
  register,
  metricsMiddleware,
  metricsHandler
};
