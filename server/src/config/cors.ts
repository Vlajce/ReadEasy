import cors from "cors";
import config from "./config.js";

export const corsConfig = cors({
  origin: config.clientOrigin,
  credentials: true,
});
