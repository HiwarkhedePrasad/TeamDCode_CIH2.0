import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
// import About from "./pages/about";
// import Contact from "./pages/contact";
// import NotFound from "./pages/NotFound";
import AssessmentPlatform from "./AssessmentTest/AssessmentPlatform";
import Navbar from "./static/navbar";
import "./App.css";

const App = () => {
  return (
    <Router>
      <Navbar /> {/* ✅ Moved outside Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} /> */}
        <Route
          path="/assessment/test/:assesId"
          element={<AssessmentPlatform />}
        />
      </Routes>
    </Router>
  );
};

export default App;
