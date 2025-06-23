import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
// import About from "./pages/about"; // example page
// import Contact from "./pages/contact"; // example page
// import NotFound from "./pages/NotFound"; // optional 404 page
import "./App.css";

import AssessmentPlatform from "./AssessmentTest/AssessmentPlatform";

const App = () => {
  return (
    <Router>
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
