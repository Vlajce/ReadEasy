export interface ReadingBook {
  id: string;
  title: string;
  author: string;
  imageUrl?: string;
}

export interface UserDTO {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  isBanned: boolean;
  nativeLanguage: string;
  readingBooks?: ReadingBook[];
  createdAt: string;
  updatedAt: string;
}
