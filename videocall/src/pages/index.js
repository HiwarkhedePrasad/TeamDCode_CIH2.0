"use client";
import React from "react";
import { Phone, PhoneOff, Bot, User, Volume2 } from "lucide-react";
import useVapi from "@/hooks/use-vapi";

export default function Home() {
  const { volumeLevel, isSessionActive, conversation, toggleCall } = useVapi();

  const getVolumeIndicator = () => {
    const intensity = Math.floor(volumeLevel * 3);
    return {
      opacity: isSessionActive ? 0.3 + volumeLevel * 0.7 : 0.1,
      scale: isSessionActive ? 1 + volumeLevel * 0.1 : 1,
    };
  };

  return (
    <div className="min-h-screen bg-[#FFFDF6] text-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-[#FAF6E9] shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isSessionActive ? "bg-[#A0C878]" : "bg-gray-400"
              }`}
            />
            <span className="text-sm font-medium">
              {isSessionActive ? "Connected" : "Disconnected"}
            </span>
          </div>
          <h1 className="text-lg font-semibold">AutoScreen.ai</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Avatar Section */}
          <div className="flex items-center justify-center space-x-16 mb-12">
            {/* AI Assistant Avatar */}
            <div className="relative">
              <div
                className="w-40 h-40 rounded-full border-4 border-[#DDEB9D] bg-[#FFFDF6] flex items-center justify-center transition-all duration-300"
                style={{
                  transform: `scale(${getVolumeIndicator().scale})`,
                  borderColor: isSessionActive ? "#A0C878" : "#d1d5db",
                }}
              >
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center">
                  <Bot className="w-10 h-10 text-white" />
                </div>
              </div>
              {isSessionActive && (
                <div className="absolute inset-0 rounded-full border-4 border-[#A0C878] animate-ping opacity-20"></div>
              )}
            </div>

            {/* Connection Line */}
            <div className="flex items-center">
              <div
                className={`h-0.5 w-12 transition-all duration-300 ${
                  isSessionActive ? "bg-[#A0C878]" : "bg-gray-300"
                }`}
              >
                {isSessionActive && (
                  <div className="h-full bg-[#A0C878] animate-pulse"></div>
                )}
              </div>
              <div className="flex space-x-1 mx-2">
                <div
                  className={`w-1 h-1 rounded-full ${
                    isSessionActive ? "bg-[#A0C878]" : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`w-1 h-1 rounded-full ${
                    isSessionActive ? "bg-[#A0C878]" : "bg-gray-300"
                  } ${isSessionActive ? "animate-pulse" : ""}`}
                ></div>
                <div
                  className={`w-1 h-1 rounded-full ${
                    isSessionActive ? "bg-[#A0C878]" : "bg-gray-300"
                  }`}
                ></div>
              </div>
              <div
                className={`h-0.5 w-12 transition-all duration-300 ${
                  isSessionActive ? "bg-[#A0C878]" : "bg-gray-300"
                }`}
              ></div>
            </div>

            {/* User Avatar */}
            <div className="relative">
              <div
                className="w-40 h-40 rounded-full border-4 border-[#DDEB9D] bg-[#FFFDF6] flex items-center justify-center transition-all duration-300"
                style={{
                  borderColor: isSessionActive ? "#A0C878" : "#d1d5db",
                }}
              >
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center relative">
                  <User className="w-10 h-10 text-white" />
                  {/* Headphones icon overlay */}
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-6 h-6 border-2 border-white rounded-full bg-transparent"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <button
              onClick={toggleCall}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 ${
                isSessionActive
                  ? "bg-[#DDEB9D] text-gray-700 hover:bg-[#A0C878] border border-[#A0C878]"
                  : "bg-[#A0C878] text-white hover:bg-[#DDEB9D] shadow-lg"
              }`}
            >
              {isSessionActive ? "Terminate" : "Start"}
            </button>
          </div>

          {/* Audio Level Indicator */}
          {isSessionActive && (
            <div className="bg-[#FAF6E9] rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center justify-center space-x-2">
                <Volume2 className="w-4 h-4 text-gray-600" />
                <div className="flex space-x-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-6 rounded-full transition-all duration-150 ${
                        i < Math.floor(volumeLevel * 10)
                          ? "bg-[#A0C878]"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">
                  {Math.round(volumeLevel * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* Conversation Display */}
          {isSessionActive && conversation.length > 0 && (
            <div className="bg-[#FAF6E9] rounded-lg shadow-sm border border-gray-200 max-w-md mx-auto">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Live Conversation</h3>
              </div>
              <div className="p-4 space-y-3 max-h-48 overflow-y-auto">
                {conversation.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.role === "assistant" ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        msg.role === "assistant"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-[#A0C878] text-white"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
