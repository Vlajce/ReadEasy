import type { User } from "@/types/user";

type Auth = {
  isAuthenticated: true;
  user: User;
};
type UnAuth = {
  isAuthenticated: false;
  user: null;
};

export type AuthContext = (Auth | UnAuth) & {
  setUser: (user: User | null) => void;
};

export const auth: AuthContext = {
  isAuthenticated: false,
  user: null,
  setUser: (user: User | null) => {
    auth.user = user;
    auth.isAuthenticated = !!user;
  },
};
