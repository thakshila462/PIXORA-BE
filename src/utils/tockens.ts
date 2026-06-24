import jwt from "jsonwebtoken";
import { IUser } from "../model/userModel";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  console.error(
    "Missing JWT_SECRET or JWT_REFRESH_SECRET environment variables",
  );
}

// user:any
export const signAccessToken = (user: IUser): string => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      sub: user._id.toString(),
      roles: user.roles,
      //   email: user.email
    },
    JWT_SECRET,
    {
      expiresIn: "30m",
    },
  );
};

export const signRefreshToken = (user: IUser): string => {
  if (!JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not configured");
  }

  return jwt.sign(
    {
      sub: user._id.toString(),
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    },
  );
};
