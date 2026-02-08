const config = {
  env: import.meta.env.VITE_ENV || "development",
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000",
  refreshEndpoint: import.meta.env.VITE_API_REFRESH_ENDPOINT || "/auth/refresh",
  cacheStaleTimeSeconds: parseInt(
    import.meta.env.VITE_CACHE_STALE_TIME_SECONDS || "60",
    10,
  ),
} as const;

export default config;
