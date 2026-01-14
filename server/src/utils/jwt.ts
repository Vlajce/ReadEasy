import jwt from "jsonwebtoken";
import config from "../config/config.js";

type JwtPayload = {
  userId: string;
};

export const signAccessToken = (userId: string): string => {
  const payload: JwtPayload = { userId };

  return jwt.sign(payload, config.jwt.access.secret as jwt.Secret, {
    expiresIn: config.jwt.access.expiresIn as jwt.SignOptions["expiresIn"],
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(
    token,
    config.jwt.access.secret as jwt.Secret
  ) as JwtPayload;
};

export const signRefreshToken = (userId: string): string => {
  const payload: JwtPayload = { userId };

  return jwt.sign(payload, config.jwt.refresh.secret as jwt.Secret, {
    expiresIn: config.jwt.refresh.expiresIn as jwt.SignOptions["expiresIn"],
  });
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(
    token,
    config.jwt.refresh.secret as jwt.Secret
  ) as JwtPayload;
};
