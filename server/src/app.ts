import express from "express";
import { authRoutes } from "./routes/auth.route.js";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/auth", authRoutes);

// Health endpoint
app.get("/", (req, res) => {
  res.status(200).json({ status: "API is healthy 🚀" });
});

export default app;
