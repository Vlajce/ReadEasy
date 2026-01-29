import jwt from "jsonwebtoken";
import config from "../config/config.js";

export interface AccessTokenPayload {
  userId: string;
}

export const signAccessToken = (userId: string): string => {
  const payload: AccessTokenPayload = { userId };

  return jwt.sign(payload, config.jwt.access.secret as jwt.Secret, {
    expiresIn: config.jwt.access.expiresIn as jwt.SignOptions["expiresIn"],
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(
    token,
    config.jwt.access.secret as jwt.Secret,
  ) as AccessTokenPayload;
};

export const signRefreshToken = (userId: string): string => {
  const payload: AccessTokenPayload = { userId };

  return jwt.sign(payload, config.jwt.refresh.secret as jwt.Secret, {
    expiresIn: config.jwt.refresh.expiresIn as jwt.SignOptions["expiresIn"],
  });
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(
    token,
    config.jwt.refresh.secret as jwt.Secret,
  ) as AccessTokenPayload;
};
