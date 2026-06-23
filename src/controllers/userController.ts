import { Request, Response } from "express";
import { UserModel } from "../model/userModel";

// CREATE USER
export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.create(req.body);
    res.status(201).json({ message: "User created", data: user });
  } catch (err) {
    res.status(500).json({ message: "Error creating user", err });
  }
};

// GET ALL USERS
export const getAllUser = async (_req: Request, res: Response) => {
  try {
    const users = await UserModel.find();
    res.status(200).json({ data: users });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// UPDATE USER (IMPORTANT: handles role + approval)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updated = await UserModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated", data: updated });
  } catch (err) {
    res.status(500).json({ message: "Error updating user", err });
  }
};

// DELETE USER
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await UserModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted", data: deleted });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", err });
  }
};