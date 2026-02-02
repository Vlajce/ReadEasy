import { User, type IUser } from "../models/user.model.js";
import { type UpdateUserInput } from "../validation/user.schema.js";

const findById = async (id: string): Promise<IUser | null> => {
  return await User.findById(id).select("-password").lean().exec();
};

const findByEmail = async (email: string): Promise<IUser | null> => {
  return await User.findOne({ email }).select("-password").lean().exec();
};
const findByUsername = async (username: string): Promise<IUser | null> => {
  return await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .select("-password")
    .lean()
    .exec();
};

const update = async (
  id: string,
  updateData: UpdateUserInput,
): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true },
  )
    .select("-password")
    .lean()
    .exec();
};

export const userRepository = {
  findById,
  findByEmail,
  findByUsername,
  update,
};
