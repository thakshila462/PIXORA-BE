import { Schema, model, Document } from "mongoose";

export interface IServiceRequest extends Document {
  serviceId: string;
  name: string;
  email: string;
  phone?: string;
  packageId: string;
  duration: number;
  serviceType: string;
  totalCost: number;
  note?: string;
  rating?: number;
  userLat?: number;
  userLng?: number;
  studioLat?: number;
  studioLng?: number;
  status: "pending" | "confirmed" | "cancelled";
  isPaid: boolean; // ⚡ Payment එක කරලාද නැද්ද කියලා track කරන්න TypeScript Interface එකට එකතු කලා
  createdAt: Date;
}

const serviceRequestSchema = new Schema<IServiceRequest>(
  {
    serviceId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    packageId: { type: String, required: true },
    duration: { type: Number, default: 1 },
    serviceType: { type: String, default: "standard" },
    totalCost: { type: Number, required: true },
    note: { type: String },
    rating: { type: Number },
    userLat: { type: Number, default: 0 },
    userLng: { type: Number, default: 0 },
    studioLat: { type: Number, default: 0 },
    studioLng: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    // ⚡ හැම අලුත් රික්වෙස්ට් එකක්ම මුලින්ම Unpaid (false) වෙන විදිහට මෙතනට දාන්න
    isPaid: {
  type: Boolean,
  default: false,
},



// paymentMethod: {
//   type: String as any,
//   enum: ["card", "mobile", "bank"],
//   default: null,
// },

// bankProofBase64: {
//   type: String,
//   default: null,
// },
  },
  { timestamps: true }
);

export const ServiceRequestModel = model<IServiceRequest>(
  "ServiceRequest",
  serviceRequestSchema
);