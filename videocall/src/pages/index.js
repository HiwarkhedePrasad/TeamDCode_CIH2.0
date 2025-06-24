"use client";

import React, { useState, useEffect } from "react"; // Import useState and useEffect
import Link from "next/link";
import { v4 as uuidv4 } from "uuid"; // Import uuidv4 for generating UUIDs
import { useRouter } from "next/router"; // Import useRouter to programmatically navigate

export default function HomePage() {
  const router = useRouter(); // Initialize useRouter

  // Function to generate a UUID and navigate
  const handleTryAutoScreen = async () => {
    const newUuid = uuidv4(); // Generate a new UUID
    const dummyCandidateId = `candidate-${Date.now()}`; // Generate a dummy candidate ID
    const dummyCandidateEmail = `candidate-${Date.now()}@example.com`; // Dummy email
    const dummyJobTitle = "Software Engineer (Trial)"; // Dummy job title for the trial

    try {
      const response = await fetch(
        `http://localhost:${
          process.env.NEXT_PUBLIC_SERVER_PORT || 5000
        }/api/create-trial-assessment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assessment_uuid: newUuid,
            candidate_id: dummyCandidateId,
            candidate_email: dummyCandidateEmail,
            job_title: dummyJobTitle,
            status: "pending",
          }),
        }
      );

      // Log response headers and status
      console.log("Response Status:", response.status);
      console.log(
        "Response Content-Type:",
        response.headers.get("content-type")
      );

      if (!response.ok) {
        // Attempt to parse JSON, but fall back to text if it's not JSON
        const contentType = response.headers.get("content-type");
        let errorBody;
        if (contentType && contentType.includes("application/json")) {
          errorBody = await response.json();
        } else {
          errorBody = await response.text(); // Read as text if not JSON
        }

        console.error("Backend Error Response (raw):", errorBody);
        throw new Error(
          `Failed to create trial assessment: ${response.status} - ${
            typeof errorBody === "object"
              ? errorBody.message || JSON.stringify(errorBody)
              : errorBody
          }`
        );
      }

      const data = await response.json(); // This line will only run if response.ok is true AND content-type is JSON
      console.log(`Trial assessment created: ${newUuid}`, data);
      router.push(`/ai-screening/${newUuid}?candidateId=${dummyCandidateId}`);
    } catch (error) {
      console.error("Error creating trial assessment (frontend catch):", error);
      alert(
        `Failed to start trial: ${error.message}. Please check your browser's console and backend server logs.`
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF6] text-gray-900 flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="bg-[#FAF6E9] shadow-sm p-4 w-full fixed top-0 left-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome to AutoScreen.ai
          </h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto pt-20">
        <h2 className="text-4xl font-bold mb-6 text-[#A0C878]">
          Streamline Your Hiring
        </h2>
        <p className="text-lg text-gray-700 mb-8 leading-relaxed">
          AutoScreen.ai provides an intelligent, AI-powered platform to
          revolutionize your candidate screening process. Conduct unbiased,
          efficient, and scalable interviews tailored to your job requirements.
        </p>

        <div className="space-y-4">
          <p className="text-xl font-medium text-gray-800">
            Ready to try AutoScreen.ai?
          </p>
          <p className="text-md text-gray-600 mb-4">
            Experience an AI-powered job screening tailored for a typical role.
          </p>

          <button
            onClick={handleTryAutoScreen}
            className="inline-block bg-[#A0C878] text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#DDEB9D] hover:text-gray-700 transition-colors shadow-lg transform hover:scale-105"
          >
            Try AutoScreen.ai Now!
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full text-center p-4 text-gray-500 text-sm mt-auto">
        &copy; {new Date().getFullYear()} AutoScreen.ai. All rights reserved.
      </div>
    </div>
  );
}
