import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { UserRole } from "../model/userModel";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthRequest extends Request {
  user?: {
    sub: string;
    roles: UserRole[];
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const cookieToken =
    typeof req.headers.cookie === "string"
      ? req.headers.cookie
          .split(";")
          .map((cookie) => cookie.trim())
          .find((cookie) => cookie.startsWith("accessToken="))
          ?.split("=")[1]
      : undefined;

  const authHeader =
    typeof req.headers.authorization === "string"
      ? req.headers.authorization
      : Array.isArray(req.headers.authorization)
        ? req.headers.authorization[0]
        : typeof req.headers["x-access-token"] === "string"
          ? req.headers["x-access-token"]
          : Array.isArray(req.headers["x-access-token"]) &&
              req.headers["x-access-token"][0]
            ? req.headers["x-access-token"][0]
            : cookieToken;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload as any;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
