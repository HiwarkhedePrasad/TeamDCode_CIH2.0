import React, { useState, useEffect } from "react";
import Vapi from "@vapi-ai/web";

const VapiWidget = () => {
  // Ensure your .env.local or .env file has VITE_VAPI_API_KEY=YOUR_PUBLIC_VAPI_CLIENT_KEY
  const apiKey = import.meta.env.VITE_VAPI_API_KEY;
  // Make sure this is YOUR actual Assistant ID from Vapi Dashboard
  const assistantId = "9cde237e-8b46-4c22-89d0-1897ac74c208";

  // Basic configuration for Vapi instance
  const config = {
    userId: "candidate-xyz", // This is optional, but good for tracking
  };

  const [vapi, setVapi] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [error, setError] = useState(null); // To display errors

  useEffect(() => {
    if (!apiKey) {
      console.error("❌ VITE_VAPI_API_KEY is missing from .env");
      setError("VAPI_API_KEY is missing. Check your .env file.");
      return;
    }

    console.log("✅ Initializing Vapi with API key (client-side):", apiKey);
    const vapiInstance = new Vapi(apiKey, config);

    setVapi(vapiInstance);

    vapiInstance.on("call-start", () => {
      console.log("✅ Call started");
      setIsConnected(true);
      setError(null); // Clear any previous errors on successful start
    });

    vapiInstance.on("call-end", () => {
      console.log("🔚 Call ended");
      setIsConnected(false);
      setIsSpeaking(false);
    });

    vapiInstance.on("speech-start", () => {
      console.log("🗣️ Assistant speaking");
      setIsSpeaking(true);
    });

    vapiInstance.on("speech-end", () => {
      console.log("🔇 Assistant done speaking");
      setIsSpeaking(false);
    });

    vapiInstance.on("message", (message) => {
      if (message.type === "transcript") {
        setTranscript((prev) => [
          ...prev,
          {
            role: message.role,
            text: message.transcript,
          },
        ]);
      }
    });

    vapiInstance.on("error", (err) => {
      console.error("❌ Vapi error:", err);
      // More specific error handling based on the error object
      if (err instanceof Error) {
        setError(`Vapi SDK Error: ${err.message}`);
      } else if (typeof err === "object" && err !== null && err.error) {
        setError(
          `Vapi API Error: ${err.error.message || JSON.stringify(err.error)}`
        );
      } else {
        setError(`An unknown Vapi error occurred: ${JSON.stringify(err)}`);
      }
    });

    // Cleanup function to stop Vapi when component unmounts
    return () => {
      console.log("Component unmounting, stopping Vapi.");
      vapiInstance?.stop();
    };
  }, [apiKey]); // Dependency array, re-run if apiKey changes

  const startCall = () => {
    if (!vapi) {
      console.error("Vapi instance not initialized.");
      setError("Vapi instance not ready. Check API Key and network.");
      return;
    }
    if (isConnected) {
      console.log("Call already connected.");
      return;
    }

    // THIS IS THE CRITICAL LOG TO DEBUG THE [object%20Object] issue
    console.log(
      "📞 Attempting to start call with assistantId:",
      assistantId,
      "Type:",
      typeof assistantId
    );

    // Vapi.start() expects a string assistant ID or a Call object (for resuming).
    // Ensure assistantId is always a string here.
    if (typeof assistantId !== "string") {
      console.error("Assistant ID is not a string!", assistantId);
      setError("Configuration Error: Assistant ID must be a string.");
      return;
    }

    vapi.start(assistantId);
  };

  const endCall = () => {
    if (vapi && isConnected) {
      console.log("📴 Ending call");
      vapi.stop();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 1000,
        fontFamily: "Arial, sans-serif",
      }}
    >
      {error && (
        <div
          style={{
            color: "red",
            marginBottom: "10px",
            padding: "8px",
            border: "1px solid red",
            borderRadius: "4px",
            background: "#ffebeb",
          }}
        >
          Error: {error}
        </div>
      )}

      {!isConnected ? (
        <button
          onClick={startCall}
          disabled={!vapi} // Disable button until Vapi is initialized
          style={{
            background: "#12A594",
            color: "#fff",
            border: "none",
            borderRadius: "50px",
            padding: "16px 24px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: !vapi ? "not-allowed" : "pointer",
            boxShadow: "0 4px 12px rgba(18, 165, 148, 0.3)",
            transition: "all 0.3s ease",
            opacity: !vapi ? 0.6 : 1, // Dim if disabled
          }}
          onMouseOver={(e) => {
            if (!vapi) return;
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 6px 16px rgba(18, 165, 148, 0.4)";
          }}
          onMouseOut={(e) => {
            if (!vapi) return;
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(18, 165, 148, 0.3)";
          }}
        >
          🎤 Talk to Assistant
        </button>
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "20px",
            width: "320px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            border: "1px solid #e1e5e9",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: isSpeaking ? "#ff4444" : "#12A594",
                  animation: isSpeaking ? "pulse 1s infinite" : "none",
                }}
              ></div>
              <span style={{ fontWeight: "bold", color: "#333" }}>
                {isSpeaking ? "Assistant Speaking..." : "Listening..."}
              </span>
            </div>
            <button
              onClick={endCall}
              style={{
                background: "#ff4444",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              End Call
            </button>
          </div>

          <div
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              marginBottom: "12px",
              padding: "8px",
              background: "#f8f9fa",
              borderRadius: "8px",
            }}
          >
            {transcript.length === 0 ? (
              <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
                Conversation will appear here...
              </p>
            ) : (
              transcript.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: "8px",
                    textAlign: msg.role === "user" ? "right" : "left",
                  }}
                >
                  <span
                    style={{
                      background: msg.role === "user" ? "#12A594" : "#333",
                      color: "#fff",
                      padding: "8px 12px",
                      borderRadius: "12px",
                      display: "inline-block",
                      fontSize: "14px",
                      maxWidth: "80%",
                    }}
                  >
                    {msg.text}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default VapiWidget;
