import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "MONGO_URI",
  "PORT",
  "CLIENT_ORIGIN",
  "JWT_ACCESS_SECRET",
  "JWT_ACCESS_EXPIRES_IN",
  "JWT_REFRESH_SECRET",
  "JWT_REFRESH_EXPIRES_IN",
];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`${key} is not defined in environment variables`);
  }
});

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  clientOrigin: process.env.CLIENT_ORIGIN!.split(","),
  mongoUri: process.env.MONGO_URI!,
  importConcurrency: parseInt(process.env.IMPORT_CONCURRENCY || "5", 10),
  jwt: {
    access: {
      secret: process.env.JWT_ACCESS_SECRET as string,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as string,
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET as string,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as string,
    },
  },
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED === "true",
    global: {
      windowMs: 1 * 60 * 1000, // 1 minute
      maxRequests: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX || "120", 10),
    },
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: parseInt(process.env.RATE_LIMIT_AUTH_MAX || "5", 10),
    },
    register: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: parseInt(process.env.RATE_LIMIT_REGISTER_MAX || "3", 10),
    },
    strict: {
      windowMs: 1 * 60 * 1000, // 1 minute
      maxRequests: parseInt(process.env.RATE_LIMIT_STRICT_MAX || "50", 10),
    },
  },
};

export default config;
