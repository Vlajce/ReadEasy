import { User, type IUser } from "../models/user.model.js";
import { type UpdateUserInput } from "../validation/user.schema.js";

const findById = async (id: string): Promise<IUser | null> => {
  return await User.findById(id).select("-password");
};

const findByEmail = async (email: string): Promise<IUser | null> => {
  return await User.findOne({ email }).select("-password");
};

const update = async (
  id: string,
  updateData: UpdateUserInput,
): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true },
  ).select("-password");
};

export const userRepository = {
  findById,
  findByEmail,
  update,
};
