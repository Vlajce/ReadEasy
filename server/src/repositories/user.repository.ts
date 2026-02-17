import { User, type IReadingBook, type IUser } from "../models/user.model.js";
import { type UpdateUserInput } from "../validation/user.schema.js";
import { type ReadingBook } from "../types/user.js";

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

const getReadingList = async (userId: string): Promise<IReadingBook[]> => {
  const user = await User.findById(userId).select("readingBooks").lean().exec();
  return user?.readingBooks || [];
};

const addBookToReadingList = async (
  userId: string,
  book: ReadingBook,
): Promise<IReadingBook[]> => {
  //Remove the bookId if it already exists (to avoid duplicates)
  await User.updateOne(
    { _id: userId },
    { $pull: { readingBooks: { id: book.id } } },
  );

  // Push it to the end and cap at 10
  const updated = await User.findByIdAndUpdate(
    userId,
    {
      $push: { readingBooks: { $each: [book], $slice: -10 } }, // Dodaj na kraj i ograniči na zadnjih 10
    },
    { returnDocument: "after", select: "readingBooks" },
  )
    .lean()
    .exec();

  return updated?.readingBooks || [];
};

const removeBookFromReadingList = async (
  userId: string,
  bookId: string,
): Promise<IReadingBook[]> => {
  const updated = await User.findByIdAndUpdate(
    userId,
    { $pull: { readingBooks: { id: bookId } } },
    { returnDocument: "after", select: "readingBooks" },
  )
    .lean()
    .exec();

  return updated?.readingBooks || [];
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
