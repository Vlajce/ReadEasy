import jwt from "jsonwebtoken";
import config from "../config/config.js";

export type TokenType = "access" | "refresh";

export interface TokenPayload {
  userId: string;
}

const secrets: Record<TokenType, jwt.Secret> = {
  access: config.jwt.access.secret as jwt.Secret,
  refresh: config.jwt.refresh.secret as jwt.Secret,
};

const expirations: Record<TokenType, jwt.SignOptions["expiresIn"]> = {
  access: config.jwt.access.expiresIn as jwt.SignOptions["expiresIn"],
  refresh: config.jwt.refresh.expiresIn as jwt.SignOptions["expiresIn"],
};

export const signToken = (userId: string, type: TokenType): string => {
  const payload: TokenPayload = { userId };
  return jwt.sign(payload, secrets[type], { expiresIn: expirations[type] });
};

export const verifyToken = (token: string, type: TokenType): TokenPayload => {
  return jwt.verify(token, secrets[type]) as TokenPayload;
};

export const signAccessToken = (userId: string) => signToken(userId, "access");
export const signRefreshToken = (userId: string) =>
  signToken(userId, "refresh");
export const verifyAccessToken = (token: string) =>
  verifyToken(token, "access");
export const verifyRefreshToken = (token: string) =>
  verifyToken(token, "refresh");
