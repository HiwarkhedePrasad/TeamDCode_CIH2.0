import React, { useState } from "react";

function ResumeUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [responseMessage, setResponseMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [debugInfo, setDebugInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [result, setResult] = useState(null);

  // Updated to match your FastAPI backend endpoints
  const FASTAPI_BASE_URL = "http://localhost:8000";
  const FASTAPI_UPLOAD_URL = `${FASTAPI_BASE_URL}/upload-resume`; // Fixed endpoint name
  const FASTAPI_HEALTH_URL = `${FASTAPI_BASE_URL}/health`;

  const addDebugInfo = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearDebugInfo = () => {
    setDebugInfo([]);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setUploadStatus("");
    setResponseMessage(null);
    setErrorMessage("");
    setDebugInfo([]);

    if (file) {
      addDebugInfo(
        `File selected: ${file.name} (${file.size} bytes, type: ${file.type})`
      );

      // Updated validation to match backend expectations (.pdf, .docx only)
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      ];

      // Also check file extension as backup
      const fileExtension = file.name.toLowerCase().split(".").pop();
      const allowedExtensions = ["pdf", "docx"];

      if (
        !allowedTypes.includes(file.type) &&
        !allowedExtensions.includes(fileExtension)
      ) {
        setErrorMessage(
          `Unsupported file type: ${file.type}. Please upload PDF or DOCX files only.`
        );
        addDebugInfo(`❌ Unsupported file type: ${file.type}`);
        return;
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setErrorMessage(
          `File too large: ${(file.size / 1024 / 1024).toFixed(
            2
          )}MB. Maximum size is 10MB.`
        );
        addDebugInfo(
          `❌ File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`
        );
        return;
      }

      addDebugInfo("✅ File validation passed");
    }
  };

  const testServerConnection = async () => {
    try {
      addDebugInfo("Testing server connection to health endpoint...");
      const response = await fetch(FASTAPI_HEALTH_URL, {
        method: "GET",
        mode: "cors",
      });

      if (response.ok) {
        const data = await response.json();
        addDebugInfo(`✅ Server health check successful: ${data.message}`);
        return true;
      } else {
        const errorText = await response.text();
        addDebugInfo(
          `❌ Server health check failed with status ${response.status}: ${errorText}`
        );
        return false;
      }
    } catch (error) {
      addDebugInfo(`❌ Server connection failed: ${error.message}`);
      return false;
    }
  };

  const handleUpload = async () => {
    // Basic validation
    if (!selectedFile || errorMessage) {
      console.error("Please select a valid CV file first.");
      setErrorMessage("Please select a valid CV file first.");
      return;
    }

    // Set loading state and clear previous messages
    setUploadStatus("Uploading...");
    setErrorMessage("");
    setResponseMessage(null);
    setUploadSuccess(false);
    setResult(null);
    setLoading(true);
    addDebugInfo("Initiating file upload...");

    // Create FormData - IMPORTANT: Use 'file' as the key to match backend
    const formData = new FormData();
    formData.append("file", selectedFile); // Changed from 'cv_file' to 'file'
    addDebugInfo(`FormData created with 'file': ${selectedFile.name}`);

    try {
      // Send POST request to FastAPI backend
      const response = await fetch(FASTAPI_UPLOAD_URL, {
        method: "POST",
        body: formData,
        // Don't set Content-Type header when using FormData
      });

      addDebugInfo(`Received response status: ${response.status}`);

      if (!response.ok) {
        // Parse error response
        let errorData;
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json();
        } else {
          errorData = { detail: await response.text() };
        }

        const detailMessage = errorData.detail
          ? typeof errorData.detail === "string"
            ? errorData.detail
            : JSON.stringify(errorData.detail)
          : `Unknown error (HTTP Status: ${response.status})`;

        addDebugInfo(`❌ Upload failed: ${response.status} - ${detailMessage}`);
        setErrorMessage(`Upload failed: ${detailMessage}`);
        throw new Error(
          `HTTP error! Status: ${response.status}, Detail: ${detailMessage}`
        );
      }

      // Parse successful response
      const data = await response.json();
      console.log("Upload successful:", data);
      setUploadStatus("Upload successful!");
      setResponseMessage(data);
      setUploadSuccess(true);
      setResult(data.data); // Store the actual result data for easier access
      addDebugInfo("✅ Upload successful. Backend response received.");

      // Display summary of results
      if (data.data) {
        addDebugInfo(`✅ Candidate: ${data.data.candidate_name}`);
        addDebugInfo(
          `✅ Positions evaluated: ${data.data.positions_evaluated}`
        );
        addDebugInfo(
          `✅ Qualified positions: ${
            data.data.qualified_positions?.length || 0
          }`
        );
        addDebugInfo(`✅ Notifications sent: ${data.data.notifications_sent}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setErrorMessage(`Network or unexpected error: ${error.message}`);
      addDebugInfo(
        `❌ Network or unexpected error during upload: ${error.message}`
      );
    } finally {
      setLoading(false);
      setUploadStatus((prev) =>
        prev.includes("successful") ? prev : "Upload failed."
      );
      addDebugInfo("Upload process finished.");
    }
  };

  return (
    <div className="p-5 max-w-4xl mx-auto font-sans border border-gray-300 rounded-lg shadow-md">
      <h2 className="text-center text-gray-800 mb-6 text-2xl font-semibold">
        AutoScreen CV Processor - Resume Upload
      </h2>

      {/* File Input */}
      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.docx" // Updated to match backend validation
          className="block mx-auto p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        />
        <p className="text-sm text-gray-600 text-center mt-2">
          Supported formats: PDF, DOCX (max 10MB)
        </p>
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || loading || errorMessage}
        className={`block mx-auto mb-4 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out
          ${
            (!selectedFile || loading || errorMessage) &&
            "opacity-60 cursor-not-allowed"
          }`}
      >
        {loading ? "Processing Resume..." : "Upload & Process Resume"}
      </button>

      {/* Server Connection Test Button */}
      <button
        onClick={testServerConnection}
        disabled={loading}
        className="block mx-auto mb-4 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-200"
      >
        Test Server Connection
      </button>

      {/* Upload Status Message */}
      {uploadStatus && !errorMessage && (
        <p
          className={`text-center mb-4 text-lg font-medium ${
            uploadStatus.includes("successful")
              ? "text-green-600"
              : "text-orange-600"
          }`}
        >
          {uploadStatus}
        </p>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-4 border border-red-300 rounded-lg bg-red-50">
          <p className="text-red-600 font-medium">Error: {errorMessage}</p>
        </div>
      )}

      {/* Success Summary */}
      {uploadSuccess && result && (
        <div className="mb-4 p-4 border border-green-300 rounded-lg bg-green-50">
          <h3 className="text-green-700 text-lg font-semibold mb-3">
            Processing Results Summary:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p>
                <strong>Candidate:</strong> {result.candidate_name}
              </p>
              <p>
                <strong>Email:</strong> {result.candidate_email}
              </p>
            </div>
            <div>
              <p>
                <strong>Positions Evaluated:</strong>{" "}
                {result.positions_evaluated}
              </p>
              <p>
                <strong>Qualified Positions:</strong>{" "}
                {result.qualified_positions?.length || 0}
              </p>
              <p>
                <strong>Notifications Sent:</strong> {result.notifications_sent}
              </p>
            </div>
          </div>

          {result.qualified_positions &&
            result.qualified_positions.length > 0 && (
              <div className="mt-3">
                <p className="font-medium text-green-700">Qualified for:</p>
                <ul className="list-disc list-inside text-sm text-green-600 ml-4">
                  {result.qualified_positions.map((position, index) => (
                    <li key={index}>{position}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}

      {/* Debug Information */}
      {debugInfo.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-700">
              Debug Information:
            </h3>
            <button
              onClick={clearDebugInfo}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
          <div className="p-3 border border-gray-300 rounded-lg bg-gray-50 max-h-64 overflow-y-auto">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap">
              {debugInfo.join("\n")}
            </pre>
          </div>
        </div>
      )}

      {/* Detailed Results (Collapsible) */}
      {result && result.detailed_evaluations && (
        <div className="mb-4">
          <details className="border border-gray-300 rounded-lg">
            <summary className="p-3 bg-gray-100 cursor-pointer font-medium">
              View Detailed Evaluation Results (
              {result.detailed_evaluations.length} positions)
            </summary>
            <div className="p-4 max-h-96 overflow-y-auto">
              {result.detailed_evaluations.map((evaluation, index) => (
                <div
                  key={index}
                  className="mb-4 p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-lg">
                      {evaluation.job_title}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        evaluation.qualified
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {evaluation.qualified ? "QUALIFIED" : "NOT QUALIFIED"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <strong>Match Score:</strong>{" "}
                      {evaluation.match_score.toFixed(1)}%
                    </p>
                    <p>
                      <strong>Experience Requirement Met:</strong>{" "}
                      {evaluation.meets_experience ? "Yes" : "No"}
                    </p>
                    {evaluation.matched_skills &&
                      evaluation.matched_skills.length > 0 && (
                        <p>
                          <strong>Matched Skills:</strong>{" "}
                          {evaluation.matched_skills.join(", ")}
                        </p>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Full FastAPI Response (Collapsible) */}
      {responseMessage && (
        <div className="mb-4">
          <details className="border border-gray-300 rounded-lg">
            <summary className="p-3 bg-gray-100 cursor-pointer font-medium">
              View Full API Response (Raw JSON)
            </summary>
            <div className="p-4">
              <pre className="whitespace-pre-wrap break-all text-sm bg-gray-50 p-4 rounded-md text-gray-800 max-h-64 overflow-y-auto">
                {JSON.stringify(responseMessage, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}

      {/* Troubleshooting Guide */}
      <div className="mt-6 p-4 border border-blue-300 rounded-lg bg-blue-50">
        <h3 className="text-blue-700 font-semibold mb-2">
          Troubleshooting Guide:
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Ensure FastAPI server is running on `http://localhost:8000`</li>
          <li>• Check that CORS is properly configured in your FastAPI app</li>
          <li>
            • Verify the upload endpoint is accessible at `/upload-resume`
          </li>
          <li>
            • Make sure the file type is supported (PDF, DOCX) and size is
            within limits (max 10MB)
          </li>
          <li>
            • Check browser console and FastAPI server logs for additional error
            details
          </li>
          <li>
            • Ensure your database connection and email configuration are
            working
          </li>
        </ul>
      </div>
    </div>
  );
}

export default ResumeUpload;
