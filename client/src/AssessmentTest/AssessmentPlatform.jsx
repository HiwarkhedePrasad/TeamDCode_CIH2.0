import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoginComponent from "./LoginComponent"; // Make sure these paths are correct
import DashboardComponent from "./DashboardComponent"; // Make sure these paths are correct
import DisqualifiedComponent from "./DisqualifiedComponent.js"; // Make sure these paths are correct

// Access the Gemini API key using import.meta.env for Vite
const GOOGLE_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// --- IMPORTANT SECURITY NOTE ---
// Exposing API keys directly in client-side code (even via .env files)
// means they are visible to anyone inspecting your deployed application's source code.
// For production applications, it is HIGHLY recommended to proxy requests
// through your own backend server to keep the API key secure.
// This example demonstrates how to use import.meta.env, not necessarily
// the most secure way to use an API key in production.

const AssessmentPlatform = () => {
  // Route & navigation
  const { assesId } = useParams(); // from URL /assessment/test/:assesId
  const navigate = useNavigate();

  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Test state
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour

  // Proctoring state
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  // Code editor state
  const [codeEditor, setCodeEditor] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");

  // Assessment details
  const [jobTitle, setJobTitle] = useState(""); // State to store the job title

  const testContainerRef = useRef(null);

  // Validate assessment link and fetch job title
  useEffect(() => {
    const validateAssessmentLink = async () => {
      if (!assesId) {
        console.error("No assesId found in URL parameters.");
        alert("Assessment link is incomplete or invalid.");
        navigate("/disqualified");
        return;
      }

      try {
        console.log(
          `Attempting to fetch assessment details for ID: ${assesId}`
        );
        // Ensure assesId does NOT have quotes around it when navigating to this page
        const response = await fetch(
          `http://localhost:5000/api/assessment/${assesId}`
        );

        if (response.ok) {
          const result = await response.json(); // Backend sends { message, data }
          console.log("Valid assessment link data:", result.data);

          // Assuming backend returns { data: { id, assessment_uuid, candidate_id, job_title, candidate_email } }
          setJobTitle(result.data.job_title || "Software Engineer");
          // You might want to store other candidate details too, e.g., for Login
          setCurrentUser({
            id: result.data.candidate_id,
            email: result.data.candidate_email,
            jobTitle: result.data.job_title, // Store job title in currentUser too if needed elsewhere
            // ... other details from 'data' if relevant for the logged-in user
          });
          setIsLoggedIn(true); // Automatically log in if link is valid
        } else {
          const errorData = await response.json();
          alert(
            `Invalid or expired assessment link: ${
              errorData.message || response.statusText
            }`
          );
          navigate("/disqualified");
        }
      } catch (error) {
        console.error("Error validating assessment link:", error);
        alert("Error occurred validating link. Redirecting.");
        navigate("/disqualified");
      }
    };

    validateAssessmentLink();
  }, [assesId, navigate]); // assesId is a dependency here

  // Auth handlers (simplified, as login might be implicit via valid link)
  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsTestStarted(false);
    setCurrentQuestion(0);
    setQuestions([]); // Clear questions on logout
    setAnswers({});
    setIsDisqualified(false);
    setTabSwitchCount(0);
    setTimeLeft(3600);
    exitFullscreen();
    navigate("/"); // Redirect to home or login page after logout
  };

  // Function to fetch questions from Gemini API
  const fetchQuestionsFromGemini = async (title) => {
    setIsLoading(true);
    if (!GOOGLE_API_KEY) {
      console.error(
        "Gemini API Key is missing. Check your .env file (VITE_GEMINI_API_KEY)."
      );
      alert(
        "Configuration error: Gemini API Key not found. Cannot start test."
      );
      setIsDisqualified(true);
      return;
    }

    try {
      const prompt = `Generate 5 technical assessment questions for a ${title} role. Include both multiple-choice questions (MCQ) and coding questions. For MCQs, provide 4 options and the correct answer index (0-3). For coding questions, provide a question, the recommended language, and starter code. Respond in a JSON array format like this:
        [
          {
            "id": 1,
            "type": "mcq",
            "question": "What is the time complexity of binary search?",
            "options": ["O(n)", "O(log n)", "O(n²)", "O(1)"],
            "correctAnswer": 1
          },
          {
            "id": 2,
            "type": "coding",
            "question": "Write a function to reverse a string without using built-in reverse methods.",
            "language": "javascript",
            "starterCode": "// Write your function here\\nfunction reverseString(str) {\\n  // Your code here\\n}"
          }
        ]`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text(); // Get raw error response
        throw new Error(
          `Gemini API error: ${response.statusText} - ${errorBody}`
        );
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error("No content generated by Gemini API.");
      }

      let parsedQuestions;
      try {
        parsedQuestions = JSON.parse(generatedText);
      } catch (jsonError) {
        const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          parsedQuestions = JSON.parse(jsonMatch[1]);
        } else {
          console.error(
            "Gemini response was not valid JSON, nor a JSON code block:",
            generatedText
          );
          throw new Error(
            "Failed to parse questions from Gemini response. Invalid format."
          );
        }
      }

      const formattedQuestions = parsedQuestions.map((q, index) => ({
        ...q,
        id: q.id || index + 1, // Ensure each question has a unique ID
      }));

      setQuestions(formattedQuestions);
      setIsTestStarted(true);
      enterFullscreen();
    } catch (error) {
      console.error("Error fetching questions from Gemini:", error);
      alert("Failed to load test questions. Please check console for details.");
      setIsDisqualified(true); // Disqualify if questions can't be loaded
    } finally {
      setIsLoading(false);
    }
  };

  const startTest = async () => {
    if (jobTitle) {
      await fetchQuestionsFromGemini(jobTitle);
    } else {
      alert(
        "Job title not loaded. Cannot start test. Please ensure the assessment link is valid and contains job details."
      );
    }
  };

  const submitAnswer = (answer) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: answer,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      updateCodeEditor(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      updateCodeEditor(currentQuestion - 1);
    }
  };

  const updateCodeEditor = (questionIndex) => {
    const question = questions[questionIndex];
    if (question?.type === "coding") {
      setCodeEditor(question.starterCode || "");
      setSelectedLanguage(question.language || "javascript");
    } else {
      setCodeEditor(""); // Clear code editor for non-coding questions
      setSelectedLanguage("javascript"); // Default language
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((question, index) => {
      if (
        question.type === "mcq" &&
        answers[index] !== undefined && // Ensure an answer was provided
        parseInt(answers[index]) === question.correctAnswer
      ) {
        score++;
      }
      // No automated evaluation for coding questions in this client-side example.
      // Coding questions would typically be sent to a backend for evaluation.
    });
    return score;
  };

  // Function to send results to the backend
  const sendResultsToBackend = async (finalScore) => {
    try {
      if (!currentUser || !currentUser.id) {
        console.error(
          "Attempted to send results without a valid current user ID."
        );
        alert("Cannot submit results: User data missing.");
        return;
      }
      const response = await fetch(
        `http://localhost:${
          import.meta.env.VITE_SERVER_PORT || 5000
        }/api/assessment/submit-results`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Include authentication token if your backend requires it
            // 'Authorization': `Bearer ${currentUser.token}`
          },
          body: JSON.stringify({
            assessmentId: assesId,
            employeeId: currentUser.id, // Assuming currentUser has an 'id'
            score: finalScore,
            totalQuestions: questions.length,
            answers: answers, // Send all answers for detailed record-keeping
            proctoringViolations: {
              tabSwitchCount: tabSwitchCount,
              isDisqualified: isDisqualified,
            },
          }),
        }
      );

      if (response.ok) {
        console.log("Assessment results submitted successfully!");
      } else {
        console.error(
          "Failed to submit assessment results:",
          response.statusText,
          await response.text() // Log full error response from backend
        );
        alert("Failed to submit results. Please contact support.");
      }
    } catch (error) {
      console.error("Error submitting assessment results:", error);
      alert("An error occurred while submitting results.");
    }
  };

  const finishTest = async () => {
    const score = calculateScore();
    alert(`Test completed! Your score: ${score}/${questions.length}`);
    await sendResultsToBackend(score); // Send results before logging out
    handleLogout();
  };

  // Proctoring
  const enterFullscreen = () => {
    if (testContainerRef.current?.requestFullscreen) {
      testContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden && isTestStarted && !isDisqualified) {
      const newCount = tabSwitchCount + 1;
      setTabSwitchCount(newCount);

      if (newCount >= 3) {
        setIsDisqualified(true);
        alert("You have been disqualified for switching tabs multiple times!");
        sendResultsToBackend(0); // Send 0 score or a specific status for disqualification
      } else {
        alert(
          `Warning: Tab switching detected! ${3 - newCount} warnings remaining.`
        );
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Effects
  useEffect(() => {
    if (isTestStarted && timeLeft > 0 && !isDisqualified) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isTestStarted) {
      finishTest();
    }
  }, [timeLeft, isTestStarted, isDisqualified, finishTest]); // Added finishTest to dependencies

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent F11 (fullscreen) and Ctrl+Shift+I (DevTools)
      if (
        isTestStarted &&
        (e.key === "F11" || (e.ctrlKey && e.shiftKey && e.key === "I"))
      ) {
        e.preventDefault();
        return false;
      }
    };

    if (isTestStarted) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      document.addEventListener("keydown", handleKeyDown);
      // Also prevent right-click context menu
      document.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", (e) => e.preventDefault());
    };
  }, [isTestStarted, tabSwitchCount, isDisqualified, sendResultsToBackend]);

  useEffect(() => {
    if (questions.length > 0 && questions[currentQuestion]?.type === "coding") {
      updateCodeEditor(currentQuestion);
    }
  }, [currentQuestion, questions]); // Added questions to dependencies

  // Rendering logic
  if (isDisqualified) {
    return <DisqualifiedComponent onReturnToLogin={handleLogout} />;
  }

  // If not logged in yet (or validation is pending)
  if (!isLoggedIn) {
    // Show login or loading state. If you expect automatic login via valid link,
    // this might show momentarily.
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        {isLoading ? (
          <p>Loading assessment details...</p>
        ) : (
          <LoginComponent onLogin={handleLogin} /> // If manual login is still needed
        )}
      </div>
    );
  }

  return (
    <DashboardComponent
      currentUser={currentUser}
      isTestStarted={isTestStarted}
      isLoading={isLoading}
      startTest={startTest}
      handleLogout={handleLogout}
      questions={questions}
      currentQuestion={currentQuestion}
      timeLeft={timeLeft}
      tabSwitchCount={tabSwitchCount}
      answers={answers}
      testContainerRef={testContainerRef}
      formatTime={formatTime}
      nextQuestion={nextQuestion}
      previousQuestion={previousQuestion}
      finishTest={finishTest}
      submitAnswer={submitAnswer}
      codeEditor={codeEditor}
      setCodeEditor={setCodeEditor}
      selectedLanguage={selectedLanguage}
      setSelectedLanguage={setSelectedLanguage}
    />
  );
};

export default AssessmentPlatform;
