import client from "prom-client";

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: "todo_app_" });

const httpRequestsTotal = new client.Counter({
  name: "todo_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

const httpRequestDuration = new client.Histogram({
  name: "todo_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

const activeRequests = new client.Gauge({
  name: "todo_active_requests",
  help: "Number of active requests being processed",
});

const dbErrorsTotal = new client.Counter({
  name: "todo_db_errors_total",
  help: "Total number of database errors",
  labelNames: ["operation"],
});

export default {
  client,
  httpRequestsTotal,
  httpRequestDuration,
  activeRequests,
  dbErrorsTotal,
};
