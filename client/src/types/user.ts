export interface ReadingBook {
  id: string;
  title: string;
  author: string;
  imageUrl?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  readingBooks?: ReadingBook[];
  createdAt: string;
  updatedAt: string;
}
