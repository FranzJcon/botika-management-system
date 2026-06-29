export const getHealthStatus = () => ({
  status: "ok",
  service: "botika-api",
  version: "1.0.0",
  timestamp: new Date().toISOString(),
});
