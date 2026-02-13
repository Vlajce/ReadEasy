import type { IUser } from "../models/user.model.js";
import type { UserDTO } from "../types/user.js";

type UserMapperInput = Pick<
  IUser,
  "_id" | "username" | "email" | "bookIds" | "createdAt" | "updatedAt"
>;

export const toUserDTO = (user: UserMapperInput): UserDTO => {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    bookIds: user.bookIds?.map((id) => id.toString()),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
};
