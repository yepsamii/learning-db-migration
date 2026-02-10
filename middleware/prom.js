export const promMiddleware = (req, res, next) => {
  activeRequests.inc();
  const end = httpRequestDuration.startTimer();

  res.on("finish", () => {
    const route = req.route?.path || req.path;
    const labels = {
      method: req.method,
      route: route,
      status_code: res.statusCode,
    };
    httpRequestsTotal.inc(labels);
    end(labels);
    activeRequests.dec();
  });

  next();
};
