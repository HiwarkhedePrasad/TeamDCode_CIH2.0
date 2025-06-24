// app/api/vapi-webhook/route.js

import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();
  const { message } = body;

  console.log("Received Vapi webhook message:", message);

  switch (message.type) {
    case "status-update":
      console.log(`Call ${message.call.id} status: ${message.call.status}`);
      // Update your database, send notifications, etc.
      break;
    case "transcript":
      console.log(`${message.role}: ${message.transcript}`);
      // Store transcript, display it in a UI, etc.
      break;
    case "function-call":
      console.log(
        `Function call: ${
          message.functionCall.name
        } with args: ${JSON.stringify(message.functionCall.parameters)}`
      );
      // Implement your backend function logic here
      // You might need to send a response back to Vapi depending on your assistant's design
      break;
    // Handle other message types as needed
    default:
      console.log("Unhandled Vapi message type:", message.type);
  }

  return NextResponse.json({ received: true });
}
