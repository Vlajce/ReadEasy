export interface UserDTO {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseDTO {
  user: UserDTO;
  accessToken: string;
}
