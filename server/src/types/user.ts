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
  nativeLanguage?: string;
  readingBooks?: ReadingBook[];
  createdAt: string;
  updatedAt: string;
}
