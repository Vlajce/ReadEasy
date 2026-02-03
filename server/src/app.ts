import express from "express";
import cookieParser from "cookie-parser";
import { authRoutes } from "./routes/auth.routes.js";
import { userRoutes } from "./routes/user.routes.js";
import { bookRoutes } from "./routes/book.routes.js";
import { vocabularyRoutes } from "./routes/vocabulary.routes.js";
import { corsConfig } from "./config/cors.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(corsConfig);

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/books", bookRoutes);
app.use("/vocabulary", vocabularyRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ status: "API is healthy 🚀" });
});

app.use(errorHandler);

export default app;
