import express from "express";

const app = express();

// Middleware
app.use(express.json());

// Health endpoint
app.get("/", (req, res) => {
  res.status(200).json({ status: "API is healthy 🚀" });
});

export default app;
