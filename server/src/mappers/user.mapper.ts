import type { IUser } from "../models/user.model.js";
import type { UserDTO } from "../types/user.js";

type UserMapperInput = Pick<
  IUser,
  "_id" | "username" | "email" | "readingBooks" | "createdAt" | "updatedAt"
>;

export const toUserDTO = (user: UserMapperInput): UserDTO => {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    readingBooks: user.readingBooks?.map((rb) => ({
      bookId: rb.bookId.toString(),
      title: rb.title,
      author: rb.author,
      imageUrl: rb.imageUrl,
    })),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
};
