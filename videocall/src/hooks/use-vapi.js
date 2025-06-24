// hooks/use-vapi.js
import { useEffect, useRef, useState, useCallback } from "react";
import Vapi from "@vapi-ai/web";

const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

const useVapi = () => {
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [conversation, setConversation] = useState([]); // Array of objects { role: string, text: string }
  const vapiRef = useRef(null);

  const initializeVapi = useCallback(() => {
    if (!publicKey || !assistantId) {
      console.error(
        "Vapi Public Key or Assistant ID is not set in environment variables."
      );
      return;
    }

    if (!vapiRef.current) {
      const vapiInstance = new Vapi(publicKey);
      vapiRef.current = vapiInstance;

      vapiInstance.on("call-start", () => {
        setIsSessionActive(true);
        setConversation([]); // Clear conversation on new call
      });

      vapiInstance.on("call-end", () => {
        setIsSessionActive(false);
        setConversation([]);
      });

      vapiInstance.on("volume-level", (volume) => {
        // Removed type annotation 'volume: number'
        setVolumeLevel(volume);
      });

      vapiInstance.on("message", (message) => {
        // Removed type annotation 'message: any'
        if (
          message.type === "transcript" &&
          message.transcriptType === "final"
        ) {
          setConversation((prev) => [
            ...prev,
            { role: message.role, text: message.transcript },
          ]);
        }
        // Handle other message types like 'function-call', 'assistant-message', etc.
      });

      vapiInstance.on("error", (e) => {
        // Removed type annotation 'e: Error'
        console.error("Vapi error:", e);
      });
    }
  }, [publicKey, assistantId]);

  useEffect(() => {
    initializeVapi();

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
        vapiRef.current = null;
      }
    };
  }, [initializeVapi]);

  const toggleCall = useCallback(async () => {
    try {
      if (isSessionActive) {
        await vapiRef.current?.stop();
      } else {
        await vapiRef.current?.start(assistantId);
      }
    } catch (err) {
      console.error("Error toggling Vapi session:", err);
    }
  }, [isSessionActive, assistantId]);

  return { volumeLevel, isSessionActive, conversation, toggleCall };
};

export default useVapi;
