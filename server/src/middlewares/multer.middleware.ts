import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto"; // Koristimo ugrađeni crypto modul
import type { Request, Response, NextFunction } from "express";

const PRIVATE_STORAGE = path.resolve("storage/private-books");

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    // Safe to assert - isAuthenticated middleware runs before multer
    const userId = req.user!.userId;
    const userDir = path.join(PRIVATE_STORAGE, userId);

    // Async mkdir je bolji od sync, recursive: true ne baca grešku ako folder postoji
    fs.mkdir(userDir, { recursive: true }, (err) => {
      if (err) return cb(err, "");
      cb(null, userDir);
    });
  },

  filename: (_req, file, cb) => {
    // Uvek generišemo unique ID + .txt
    // Nema više brige oko duplikata, encodinga, race conditiona
    const uniqueName = `${crypto.randomUUID()}.txt`;
    cb(null, uniqueName);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Zadržavamo basic check, ali imaj na umu da mimetype može biti lažiran
  // Dublja provera je moguća u kontroleru ako treba
  if (file.mimetype !== "text/plain" || ext !== ".txt") {
    cb(new Error("INVALID_FILE_TYPE"));
    return;
  }

  cb(null, true);
};

export const uploadPrivateBook = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
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

  const errorMessages: Record<string, string> = {
    INVALID_FILE_TYPE: "Only .txt files are allowed",
  };

  if (err.message in errorMessages) {
    return res.status(400).json({ message: errorMessages[err.message] });
  }

  next(err);
};
