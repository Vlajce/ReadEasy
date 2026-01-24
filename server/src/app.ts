import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { authRoutes } from "./routes/auth.routes.js";
import { userRoutes } from "./routes/user.routes.js";
import { bookRoutes } from "./routes/book.routes.js";
import { vocabularyRoutes } from "./routes/vocabulary.routes.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5000",
    credentials: true,
  }),
);

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/books", bookRoutes);
app.use("/vocabulary", vocabularyRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ status: "API is healthy 🚀" });
});

export default app;
