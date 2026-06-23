import { Request, Response } from "express";
import mongoose from "mongoose";
import { ServiceRequestModel } from "../model/ServiceRequestModel";

export const createServiceRequest = async (req: Request, res: Response) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required fields" });
  }

  try {
    const request = await ServiceRequestModel.create(req.body);
    return res.status(201).json({ data: request });
  } catch (err) {
    console.error("Service request create failed:", err);

    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: Object.values(err.errors).map((error) => error.message),
      });
    }

    return res
      .status(500)
      .json({ message: "Failed to create service request" });
  }
};


// serviceRequestController.ts එකට අලුතින් එකතු කරන්න:
export const updateServiceRequestStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  // Schema එකේ තියෙන නිවැරදි ඒවාදැයි චෙක් කිරීම
  const validStatuses = ["pending", "confirmed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
  }

  try {
    const updatedRequest = await ServiceRequestModel.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Service request not found" });
    }

    return res.status(200).json({ data: updatedRequest });
  } catch (err) {
    console.error("Status update failed:", err);
    return res.status(500).json({ message: "Failed to update status" });
  }
};

export const paymentSync = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      serviceId,
      paymentMethod,
      bankProofBase64
    } = req.body;

    const booking =
      await ServiceRequestModel.findOne({
        serviceId,
      });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    booking.isPaid = true;

    if (paymentMethod) {
      booking.set("paymentMethod", paymentMethod);
    }

    if (bankProofBase64) {
      booking.set(
        "bankProofBase64",
        bankProofBase64
      );
    }

    await booking.save();

    return res.status(200).json({
      message: "Payment synced",
      data: booking,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Payment sync failed",
    });
  }
};

// serviceRequestController.ts එකට එකතු කරන්න:
export const togglePaymentStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isPaid } = req.body; // frontend එකෙන් true හෝ false එවයි

  try {
    const updatedRequest = await ServiceRequestModel.findByIdAndUpdate(
      id,
      { isPaid },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Service request not found" });
    }

    return res.status(200).json({ data: updatedRequest });
  } catch (err) {
    console.error("Payment status update failed:", err);
    return res.status(500).json({ message: "Failed to update payment status" });
  }
};

export const getAllServiceRequests = async (_: Request, res: Response) => {
  try {
    const requests = await ServiceRequestModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ data: requests });
  } catch (err) {
    console.error("Service request fetch failed:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch service requests" });
  }
};