import React, { useState, useEffect, useRef } from "react";
import LoginComponent from "./LoginComponent";
import DashboardComponent from "./DashboardComponent";
import DisqualifiedComponent from "./DisqualifiedComponent.js";

const AssessmentPlatform = () => {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Test state
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds

  // Proctoring state
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  // Code editor state
  const [codeEditor, setCodeEditor] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");

  const testContainerRef = useRef(null);

  // Sample questions - In production, these would come from Gemini AI API
  const sampleQuestions = [
    {
      id: 1,
      type: "mcq",
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correctAnswer: 1,
    },
    {
      id: 2,
      type: "coding",
      question:
        "Write a function to reverse a string without using built-in reverse methods.",
      language: "javascript",
      starterCode:
        "// Write your function here\nfunction reverseString(str) {\n  // Your code here\n}",
    },
    {
      id: 3,
      type: "mcq",
      question: "Which data structure uses LIFO principle?",
      options: ["Queue", "Stack", "Array", "Linked List"],
      correctAnswer: 1,
    },
    {
      id: 4,
      type: "coding",
      question:
        "Implement a function to find the factorial of a number using recursion.",
      language: "python",
      starterCode:
        "# Write your function here\ndef factorial(n):\n    # Your code here\n    pass",
    },
  ];

  // Authentication handlers
  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsTestStarted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setIsDisqualified(false);
    setTabSwitchCount(0);
    setTimeLeft(3600);
    exitFullscreen();
  };

  // Test management
  const startTest = async () => {
    setIsLoading(true);

    try {
      // Simulate API call to fetch questions from Gemini AI
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setQuestions(sampleQuestions);
      setIsTestStarted(true);
      enterFullscreen();
    } catch (error) {
      console.error("Failed to load questions:", error);
      alert("Failed to load questions. Please try again.");
    } finally {
      setIsLoading(false);
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
    }
  };

  const finishTest = () => {
    const score = calculateScore();
    alert(`Test completed! Your score: ${score}/${questions.length}`);
    handleLogout();
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((question, index) => {
      if (
        question.type === "mcq" &&
        answers[index] === question.correctAnswer
      ) {
        score++;
      }
      // For coding questions, you'd need to implement code evaluation
      // This would typically involve running the code against test cases
    });
    return score;
  };

  // Proctoring functions
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
      } else {
        alert(
          `Warning: Tab switching detected! ${3 - newCount} warnings remaining.`
        );
      }
    }
  };

  // Utility functions
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Effects

  // Timer effect
  useEffect(() => {
    if (isTestStarted && timeLeft > 0 && !isDisqualified) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isTestStarted) {
      finishTest();
    }
  }, [timeLeft, isTestStarted, isDisqualified]);

  // Proctoring event listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
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
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTestStarted, tabSwitchCount, isDisqualified]);

  // Update code editor when question changes
  useEffect(() => {
    if (questions[currentQuestion]?.type === "coding") {
      updateCodeEditor(currentQuestion);
    }
  }, [currentQuestion, questions]);

  // Render components based on state
  if (isDisqualified) {
    return <DisqualifiedComponent onReturnToLogin={handleLogout} />;
  }

  if (!isLoggedIn) {
    return <LoginComponent onLogin={handleLogin} />;
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
