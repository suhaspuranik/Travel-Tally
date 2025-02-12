import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import PlanNewTrip from "./components/new-trip/PlanNewTrip";
import TripDetails from "./components/edit-trip/TripDetails";
import Dashboard from "./components/dashboard/Dashboard";
import Home from "./Home";
import ProtectedRoute from "./components/ProtectedRoutes";
import ResetPassword from "./components/forgotpassword/ResetPassword";
import ForgotPassword from "./components/forgotpassword/ForgotPassword";
import TripExpenses from "./components/expenses/TripExpenses";
import UserHome from "./components/dashboard/UserHome";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/plan-new-trip"
          element={<ProtectedRoute element={PlanNewTrip} />}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={Dashboard} />}
        />
        <Route
          path="/trips/:tripId"
          element={<ProtectedRoute element={TripDetails} />}
        />
        <Route
          path="/trips/:tripId/expenses"
          element={<ProtectedRoute element={TripExpenses} />}
        />
        <Route
          path="/UserHome"
          element={<ProtectedRoute element={UserHome} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
