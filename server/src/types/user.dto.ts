import type { IUser } from "../models/user.model.js";

export interface UserDTO {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponseDTO {
  user: UserDTO;
  accessToken: string;
}

export const toUserDTO = (user: IUser): UserDTO => {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
