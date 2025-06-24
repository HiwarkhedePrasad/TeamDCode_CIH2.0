"use client";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
// app/page.jsx
// Important for App Router to make it a client component

import React from "react";
import useVapi from "@/hooks/use-vapi"; // Adjust path if needed

export default function Home() {
  const { volumeLevel, isSessionActive, conversation, toggleCall } = useVapi();

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Vapi AI Assistant</h1>
      <button
        onClick={toggleCall}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: isSessionActive ? "#ff4d4d" : "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {isSessionActive ? "End Call" : "Start Call"}
      </button>

      {isSessionActive && (
        <div style={{ marginTop: "20px" }}>
          <p>Volume Level: {volumeLevel.toFixed(2)}</p>
          <h3>Conversation:</h3>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              height: "200px",
              overflowY: "scroll",
              backgroundColor: "#f9f9f9",
            }}
          >
            {conversation.length === 0 ? (
              <p>No conversation yet...</p>
            ) : (
              conversation.map((msg, index) => (
                <p key={index}>
                  <strong>
                    {msg.role === "assistant" ? "Assistant" : "You"}:
                  </strong>{" "}
                  {msg.text}
                </p>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
