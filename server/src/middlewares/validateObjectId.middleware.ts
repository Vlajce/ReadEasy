import mongoose from "mongoose";
import type { Request, Response, NextFunction } from "express";

export const validateObjectId = (param = "id") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.params[param];

    // Checks: undefined, null, empty string, array, or invalid ObjectId format
    if (
      typeof value !== "string" ||
      value.trim() === "" ||
      !mongoose.Types.ObjectId.isValid(value)
    ) {
      return res.status(400).json({ message: `Invalid ${param} format` });
    }

    next();
  };
};
