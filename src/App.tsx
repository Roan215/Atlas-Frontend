import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ERDashboard from "./pages/ERDashboard";
import BillingDashboard from "./pages/BillingDashboard";
import ParamedicDashboard from "./pages/ParamedicDashboard";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* THIS LINE IS CRITICAL: path="/" maps to LandingPage */}
        <Route path="/" element={<LandingPage />} />

        <Route path="/er" element={<ERDashboard />} />
        <Route path="/billing" element={<BillingDashboard />} />
        <Route path="/paramedic" element={<ParamedicDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
