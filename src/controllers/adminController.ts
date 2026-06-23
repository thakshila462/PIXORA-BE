import { Request, Response } from "express";
import { ServiceRequestModel } from "../model/ServiceRequestModel";
import { UserModel } from "../model/userModel";

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.countDocuments();

    const bookings = await ServiceRequestModel.find();

    let pending = 0;
    let completed = 0;
    let cancelled = 0;
    let paid = 0;
    let revenue = 0;

    bookings.forEach((b) => {
      const status = b.status?.toUpperCase();

      if (status === "PENDING") pending++;
      if (status === "COMPLETED") completed++;
      if (status === "CANCELLED") cancelled++;
      if (status === "PAID") paid++;

      revenue += b.totalCost || 0;
    });

    res.json({
      success: true,
      data: {
        users,
        totalBookings: bookings.length,
        pending,
        completed,
        cancelled,
        paid,
        revenue,
        mostPopularPackage: "Wedding Gold",
        monthlyRevenue: [120000, 150000, 180000, 210000, 240000, 300000],
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Dashboard error",
      error: err,
    });
  }
};