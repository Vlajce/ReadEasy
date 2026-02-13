import { User, type IUser } from "../models/user.model.js";
import { type UpdateUserInput } from "../validation/user.schema.js";

const findById = async (id: string): Promise<IUser | null> => {
  return await User.findById(id).lean().exec();
};

const findByEmail = async (email: string): Promise<IUser | null> => {
  return await User.findOne({ email }).lean().exec();
};

const findByUsername = async (username: string): Promise<IUser | null> => {
  return await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
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
    { returnDocument: "after", runValidators: true },
  )
    .lean()
    .exec();
};

const getReadingList = async (userId: string): Promise<string[]> => {
  const user = await User.findById(userId).select("bookIds").lean().exec();
  return (user?.bookIds || []).map((id) => id.toString());
};

const addBookToReadingList = async (
  userId: string,
  bookId: string,
): Promise<string[]> => {
  //Remove the bookId if it already exists (to avoid duplicates)
  await User.updateOne({ _id: userId }, { $pull: { bookIds: bookId } });

  // Push it to the end and cap at 10
  const updated = await User.findByIdAndUpdate(
    userId,
    {
      $push: { bookIds: { $each: [bookId], $slice: -10 } }, // Dodaj na kraj i ograniči na zadnjih 10
    },
    { returnDocument: "after", select: "bookIds" },
  )
    .lean()
    .exec();

  return (updated?.bookIds || []).map((id) => id.toString());
};

const removeBookFromReadingList = async (
  userId: string,
  bookId: string,
): Promise<string[]> => {
  const updated = await User.findByIdAndUpdate(
    userId,
    { $pull: { bookIds: bookId } },
    { returnDocument: "after", select: "bookIds" },
  )
    .lean()
    .exec();

  return (updated?.bookIds || []).map((id) => id.toString());
};

export const userRepository = {
  findById,
  findByEmail,
  findByUsername,
  update,
  getReadingList,
  addBookToReadingList,
  removeBookFromReadingList,
};
