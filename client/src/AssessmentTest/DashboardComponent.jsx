import React from "react";
import { Clock, Brain, Code, AlertTriangle } from "lucide-react";

const DashboardComponent = ({
  currentUser,
  isTestStarted,
  isLoading,
  startTest,
  handleLogout,
  questions,
  currentQuestion,
  timeLeft,
  tabSwitchCount,
  answers,
  testContainerRef,
  formatTime,
  nextQuestion,
  previousQuestion,
  finishTest,
  submitAnswer,
  codeEditor,
  setCodeEditor,
  selectedLanguage,
  setSelectedLanguage,
}) => {
  // Pre-test welcome screen
  if (!isTestStarted) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-2xl">
            {/* Welcome Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome, {currentUser?.name}!
              </h1>
              <p className="text-gray-600 text-lg">
                Ready to begin your AI-powered assessment?
              </p>
            </div>

            {/* Test Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                <Clock className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="text-gray-900 text-lg font-semibold mb-2">
                  Duration
                </h3>
                <p className="text-gray-600">60 minutes</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <Brain className="w-8 h-8 text-green-600 mb-3" />
                <h3 className="text-gray-900 text-lg font-semibold mb-2">
                  Questions
                </h3>
                <p className="text-gray-600">AI Generated</p>
              </div>
              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                <Code className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className="text-gray-900 text-lg font-semibold mb-2">
                  Format
                </h3>
                <p className="text-gray-600">MCQ + Coding</p>
              </div>
            </div>

            {/* Important Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-yellow-800 font-semibold mb-2">
                    Important Instructions
                  </h3>
                  <ul className="text-gray-700 space-y-1 text-sm">
                    <li>• The test will run in fullscreen mode</li>
                    <li>
                      • Tab switching will result in warnings and eventual
                      disqualification
                    </li>
                    <li>• You have 3 warnings before disqualification</li>
                    <li>• Code questions will open a built-in editor</li>
                    <li>• All answers are auto-saved</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={startTest}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:transform-none disabled:cursor-not-allowed"
              >
                {isLoading ? "Loading Questions..." : "Start Assessment"}
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-8 py-3 rounded-xl transition-all duration-300 border border-gray-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get current question
  const currentQ = questions[currentQuestion];
  if (!currentQ) return null;

  // Test interface
  return (
    <div ref={testContainerRef} className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-200 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-gray-900 text-xl font-bold">AI Assessment</h1>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
            </div>
            {tabSwitchCount > 0 && (
              <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm border border-red-200">
                Warnings: {tabSwitchCount}/3
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-lg">
        <h2 className="text-gray-900 text-xl font-semibold mb-4">
          {currentQ.question}
        </h2>

        {currentQ.type === "mcq" ? (
          /* MCQ Options */
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <label
                key={index}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-all duration-200 border border-gray-200"
              >
                <input
                  type="radio"
                  name={`question_${currentQuestion}`}
                  value={index}
                  checked={answers[currentQuestion] === index}
                  onChange={() => submitAnswer(index)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        ) : (
          /* Code Editor */
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>
            <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-300">
              <textarea
                value={codeEditor}
                onChange={(e) => {
                  setCodeEditor(e.target.value);
                  submitAnswer(e.target.value);
                }}
                className="w-full h-64 p-4 bg-gray-900 text-green-400 font-mono text-sm resize-none focus:outline-none"
                placeholder="Write your code here..."
                style={{
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={previousQuestion}
          disabled={currentQuestion === 0}
          className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 disabled:text-gray-400 px-6 py-3 rounded-xl transition-all duration-300 border border-gray-200"
        >
          Previous
        </button>

        {/* Progress Dots */}
        <div className="flex gap-3">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentQuestion
                  ? "bg-blue-600 scale-125"
                  : answers[index] !== undefined
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Next/Finish Button */}
        {currentQuestion === questions.length - 1 ? (
          <button
            onClick={finishTest}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Finish Test
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardComponent;
