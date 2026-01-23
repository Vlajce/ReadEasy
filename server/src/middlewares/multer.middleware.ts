import multer from "multer";
import path from "path";
import fs from "fs";
import type { Request, Response, NextFunction } from "express";

const PRIVATE_STORAGE = path.resolve("storage/private-books");

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    // Safe to assert - isAuthenticated middleware runs before multer
    const userId = req.user!.userId;
    const userDir = path.join(PRIVATE_STORAGE, userId);

    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    cb(null, userDir);
  },

  filename: (req, file, cb) => {
    const userId = req.user!.userId;
    const ext = path.extname(file.originalname).toLowerCase();

    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 100);

    const finalName = `${baseName}${ext}`;
    const fullPath = path.join(PRIVATE_STORAGE, userId, finalName);

    if (fs.existsSync(fullPath)) {
      return cb(new Error("DUPLICATE_FILE"), "");
    }

    cb(null, finalName);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.mimetype !== "text/plain" || ext !== ".txt") {
    cb(new Error("INVALID_FILE_TYPE"));
    return;
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter,
});

export const handleUploadError = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File too large. Max size is 10MB" });
    }
    return res.status(400).json({ message: "File upload error" });
  }

  // Custom error codes for cleaner handling
  const errorMessages: Record<string, string> = {
    DUPLICATE_FILE: "A book with this name already exists",
    INVALID_FILE_TYPE: "Only .txt files are allowed",
  };

  if (err.message in errorMessages) {
    return res.status(400).json({ message: errorMessages[err.message] });
  }

  next(err);
};
