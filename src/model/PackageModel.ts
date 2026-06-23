import { Schema, model, Document } from "mongoose";

export interface IPackage extends Document {
  category: "wedding" | "birthday" | "graduation";
  title: string;
  price: number;
  duration: number;
  photosCount: number;
  features: string[];
  isPopular: boolean;
}

const packageSchema = new Schema<IPackage>(
  {
    category: {
      type: String,
      enum: ["wedding", "birthday", "graduation"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    photosCount: {
      type: Number,
      required: true,
      min: 0,
    },

    features: [
      {
        type: String,
        trim: true,
      },
    ],

    isPopular: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const PackageModel = model<IPackage>("Package", packageSchema);