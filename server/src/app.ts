import express from "express";

const app = express();

// Middleware
app.use(express.json());

// Health endpoint
app.get("/", (_, res) => {
  res.status(200).json({ status: "API is healthy 🚀" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
