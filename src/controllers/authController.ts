import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { UserModel, UserRole } from "../model/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const jwtConfigIsValid = (): boolean => {
  if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    console.error(
      "Missing JWT_SECRET or JWT_REFRESH_SECRET environment variables",
    );
    return false;
  }
  return true;
};

// ================= REGISTER =================
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await UserModel.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // default USER
    let assignedRole: UserRole = UserRole.USER;

    if (role === UserRole.ADMIN) assignedRole = UserRole.ADMIN;
    if (role === UserRole.CREATOR) assignedRole = UserRole.CREATOR;

    const user = await UserModel.create({
      name,
      email,
      password: hashed,
      roles: [assignedRole],
      approved: assignedRole === UserRole.ADMIN,
    });

    return res.status(201).json({
      message: "Registered",
      data: {
        id: user._id,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Register failed" });
  }
};

// ================= LOGIN =================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await UserModel.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    if (!jwtConfigIsValid()) {
      return res
        .status(500)
        .json({ message: "Server token configuration error" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(401).json({ message: "Invalid email or password" });

    const accessToken = jwt.sign(
      { sub: user._id.toString(), roles: user.roles },
      JWT_SECRET as string,
      { expiresIn: "1h" },
    );

    const refreshToken = jwt.sign(
      { sub: user._id.toString() },
      JWT_REFRESH_SECRET as string,
      {
        expiresIn: "7d",
      },
    );

    return res.json({
      data: {
        id: user._id,
        email: user.email,
        roles: user.roles,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};

// ================= ME =================
export const getMyDetails = async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.user?.sub).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ data: user });
  } catch {
    return res.status(500).json({ message: "Error" });
  }
};

// ================= ADMIN CREATE =================
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const exists = await UserModel.findOne({ email });
    if (exists) return res.status(400).json({ message: "Exists" });

    const hashed = await bcrypt.hash(password, 10);

    const admin = await UserModel.create({
      name,
      email,
      password: hashed,
      roles: [UserRole.ADMIN],
      approved: true,
    });

    return res.status(201).json({
      message: "Admin created",
      data: admin,
    });
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};

// ================= ADMIN DASHBOARD =================
export const getAdminDashboard = async (req: AuthRequest, res: Response) => {
  return res.json({
    message: "Admin dashboard access granted",
    data: {
      userId: req.user?.sub,
      roles: req.user?.roles,
    },
  });
};
