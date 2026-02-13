export interface UserDTO {
  id: string;
  username: string;
  email: string;
  bookIds?: string[];
  createdAt: string;
  updatedAt: string;
}
