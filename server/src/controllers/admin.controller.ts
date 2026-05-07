import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async.handler.js";
import { sendSuccess } from "../utils/response.handler.js";
import { User } from "../models/user.model.js";
import { VocabularyEntry } from "../models/vocabulary.model.js";
import { NotFoundError } from "../errors/not-found.error.js";
import { BadRequestError } from "../errors/bad-request.error.js";

const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find()
    .select("username email role isBanned nativeLanguage createdAt")
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  const data = users.map((u) => ({
    id: u._id.toString(),
    username: u.username,
    email: u.email,
    role: u.role,
    isBanned: u.isBanned,
    nativeLanguage: u.nativeLanguage ?? null,
    createdAt: u.createdAt,
  }));

  return sendSuccess(res, data, "Users fetched successfully", 200);
});

const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (id === req.user!.userId) {
    throw new BadRequestError("You cannot delete your own account");
  }

  const user = await User.findById(id).exec();

  if (!user) throw new NotFoundError("User not found");

  if (user.role === "admin") {
    throw new BadRequestError("You cannot delete another admin account");
  }

  // Delete all vocabulary entries for the user
  await VocabularyEntry.deleteMany({ userId: id }).exec();

  await User.findByIdAndDelete(id).exec();

  return sendSuccess(res, null, "User deleted successfully", 200);
});

const banUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (id === req.user!.userId) {
    throw new BadRequestError("You cannot ban your own account");
  }

  const user = await User.findById(id).exec();

  if (!user) throw new NotFoundError("User not found");

  if (user.role === "admin") {
    throw new BadRequestError("You cannot ban another admin account");
  }

  if (user.isBanned) {
    throw new BadRequestError("User is already banned");
  }

  // Invalidate all refresh tokens — user will be logged out immediately
  user.isBanned = true;
  user.refreshTokens = [];
  await user.save();

  return sendSuccess(res, null, "User banned successfully", 200);
});

const unbanUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id).exec();

  if (!user) throw new NotFoundError("User not found");

  if (!user.isBanned) {
    throw new BadRequestError("User is not banned");
  }

  user.isBanned = false;
  await user.save();

  return sendSuccess(res, null, "User unbanned successfully", 200);
});

const getStats = asyncHandler(async (req: Request, res: Response) => {
  const [topBooks, topWords, totalUsers, totalWords] = await Promise.all([
    // Top books — how many users have that book in their readingBooks
    User.aggregate([
      { $unwind: "$readingBooks" },
      {
        $group: {
          _id: "$readingBooks.id",
          title: { $first: "$readingBooks.title" },
          author: { $first: "$readingBooks.author" },
          readerCount: { $sum: 1 },
        },
      },
      { $sort: { readerCount: -1 } },
      { $limit: 10 },
    ]).exec(),

    // Top words — how many different users have that word in their vocabulary
    VocabularyEntry.aggregate([
      {
        $group: {
          _id: { baseForm: "$baseForm", language: "$language" },
          userCount: { $addToSet: "$userId" },
          translation: { $first: "$translation" },
        },
      },
      {
        $project: {
          baseForm: "$_id.baseForm",
          language: "$_id.language",
          translation: 1,
          userCount: { $size: "$userCount" },
        },
      },
      { $sort: { userCount: -1 } },
      { $limit: 10 },
    ]).exec(),

    User.countDocuments().exec(),

    VocabularyEntry.countDocuments().exec(),
  ]);

  return sendSuccess(
    res,
    {
      overview: {
        totalUsers,
        totalWords,
      },
      topBooks: topBooks.map((b) => ({
        id: b._id?.toString() ?? null,
        title: b.title,
        author: b.author,
        readerCount: b.readerCount,
      })),
      topWords: topWords.map((w) => ({
        baseForm: w.baseForm,
        language: w.language,
        translation: w.translation,
        userCount: w.userCount,
      })),
    },
    "Admin stats fetched successfully",
    200,
  );
});

export const adminController = {
  getUsers,
  deleteUser,
  banUser,
  unbanUser,
  getStats,
};
