import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { UserRole } from "../model/userModel";

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const ok = roles.some((r) => req.user!.roles.includes(r));

    if (!ok) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};