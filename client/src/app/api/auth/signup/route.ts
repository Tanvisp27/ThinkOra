import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Buyer } from "@/models/Buyer";
import { Seller } from "@/models/Seller";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { name, email, password, role, walletAddress } = body;

    if (!name || !email || !role || !walletAddress) {
      return NextResponse.json(
        { message: "Name, email, role, and wallet address are required." },
        { status: 400 }
      );
    }

    if (role === "buyer") {
      // Check if buyer exists
      const existingBuyer = await Buyer.findOne({ email });
      if (existingBuyer) {
        return NextResponse.json({ message: "Buyer already exists with this email." }, { status: 409 });
      }

      const newBuyer = await Buyer.create({ name, email, password, walletAddress });
      return NextResponse.json({ message: "Buyer created successfully", user: newBuyer }, { status: 201 });

    } else if (role === "seller") {
      // Check if seller exists
      const existingSeller = await Seller.findOne({ email });
      if (existingSeller) {
        return NextResponse.json({ message: "Seller already exists with this email." }, { status: 409 });
      }

      const newSeller = await Seller.create({ name, email, password, walletAddress });
      return NextResponse.json({ message: "Seller created successfully", user: newSeller }, { status: 201 });
    } else {
      return NextResponse.json({ message: "Invalid role specified." }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Internal server error.", error: error.message },
      { status: 500 }
    );
  }
}
