import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Buyer } from "@/models/Buyer";
import { Seller } from "@/models/Seller";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    // Check if the user is a Seller first
    let user = await Seller.findOne({ email });
    let role = "seller";

    // If not a Seller, check if they are a Buyer
    if (!user) {
      user = await Buyer.findOne({ email });
      role = "buyer";
    }

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials. User not found." },
        { status: 401 }
      );
    }

    // Note: In production you'd use bcrypt to compare passwords.
    // For this prototype, we're doing a plain text check based on the schema.
    if (user.password !== password) {
       return NextResponse.json(
        { message: "Invalid password." },
        { status: 401 }
       );
    }

    return NextResponse.json({ 
      message: "Login successful", 
      user: {
        name: user.name,
        email: user.email,
        walletAddress: user.walletAddress,
        role: role
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error.", error: error.message },
      { status: 500 }
    );
  }
}
