import mongoose, { Schema, model, models } from "mongoose";

export interface IBuyer {
  name: string;
  email: string;
  walletAddress: string;
  password?: string;
  createdAt: Date;
}

const BuyerSchema = new Schema<IBuyer>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  walletAddress: { type: String, required: true },
  password: { type: String, required: false }, // Optional if using purely web3 in the future
  createdAt: { type: Date, default: Date.now },
});

export const Buyer = models.Buyer || model<IBuyer>("Buyer", BuyerSchema);
