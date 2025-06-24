// app/api/make-call/route.js

import { VapiClient } from "@vapi-ai/server-sdk";
import { NextResponse } from "next/server";

const vapi = new VapiClient({
  token: process.env.VAPI_API_KEY, // Use your private API key
});

export async function POST(req) {
  try {
    const { phoneNumber, assistantId } = await req.json();

    if (!phoneNumber || !assistantId) {
      return NextResponse.json(
        { error: "Phone number and assistant ID are required" },
        { status: 400 }
      );
    }

    const call = await vapi.calls.create({
      phoneNumberId: phoneNumber, // This should be a Vapi Phone Number ID
      assistantId: assistantId,
      customer: { number: "+1234567890" }, // Replace with actual customer number
      // You can add more metadata or other configurations here
    });

    return NextResponse.json({ callId: call.id });
  } catch (error) {
    console.error("Error creating Vapi call:", error);
    return NextResponse.json(
      { error: "Failed to create Vapi call" },
      { status: 500 }
    );
  }
}
