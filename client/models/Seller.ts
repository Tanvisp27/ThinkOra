import mongoose, { Schema, model, models } from "mongoose";

export interface ISeller {
  name: string;
  email: string;
  walletAddress: string;
  password?: string;
  createdAt: Date;
}

const SellerSchema = new Schema<ISeller>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  walletAddress: { type: String, required: true },
  password: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

export const Seller = models.Seller || model<ISeller>("Seller", SellerSchema);
