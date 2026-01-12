import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["MONGO_URI", "PORT"];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`${key} is not defined in environment variables`);
  }
});

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  mongoUri: process.env.MONGO_URI!,
};

export default config;
