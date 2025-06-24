import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
// import About from "./pages/about";
// import Contact from "./pages/contact";
// import NotFound from "./pages/NotFound";
import AssessmentPlatform from "./AssessmentTest/AssessmentPlatform";
import Navbar from "./static/navbar";
import "./App.css";
import InterviewerInterface from "./InterviewAssessment/InterViewPlatform";
import InterviewPlatform from "./InterviewAssessment/InterViewPlatform";
import VapiInterviewAgent from "./InterviewAssessment/VapiInterviewAgent";
import VapiWidget from "./InterviewAssessment/VapiInterviewAgent";
import ResumeUpload from "./resumeUpload";

const App = () => {
  return (
    <Router>
      <Navbar /> {/* ✅ Moved outside Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resume" element={<ResumeUpload />} />
        {/* <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} /> */}
        <Route path="/assessment/:assesId" element={<AssessmentPlatform />} />
        <Route path="/interview/:id" element={<InterviewPlatform />} />
        <Route path="/interview/vapi/:id" element={<VapiWidget />} />
        <Route path="/interviewer" element={<InterviewerInterface />} />
      </Routes>
    </Router>
  );
};

export default App;
