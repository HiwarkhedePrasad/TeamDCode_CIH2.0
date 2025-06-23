import React from "react";
import { AlertTriangle } from "lucide-react";

const DisqualifiedComponent = ({ onReturnToLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
      <div className="bg-white rounded-3xl p-8 text-center border border-red-200 shadow-2xl max-w-md w-full">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Disqualified</h1>
        <p className="text-gray-600 mb-6">
          You have been disqualified for violating test protocols. Multiple tab
          switches were detected during the assessment.
        </p>
        <button
          onClick={onReturnToLogin}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
};

export default DisqualifiedComponent;
