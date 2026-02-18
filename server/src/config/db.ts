import mongoose from "mongoose";
import config from "./config.js";
import { VocabularyEntry } from "../models/vocabulary.model.js";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);

    // Sync indexes so that any changed index definitions (e.g. added
    // language_override) are picked up. Mongoose will drop stale indexes
    // and create missing ones.
    await VocabularyEntry.syncIndexes();
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
