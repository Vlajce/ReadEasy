import type { Request, Response } from "express";
//import { User } from "../models/user.model.js";

const getCurrentUser = async (req: Request, res: Response) => {
  try {
    //dok ne ubacim auth
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateCurrentUser = async (req: Request, res: Response) => {
  try {
    //dok ne ubacim auth
  } catch (error) {
    console.error("Update current user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const userController = {
  getCurrentUser,
  updateCurrentUser,
};
