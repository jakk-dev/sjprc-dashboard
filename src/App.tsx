import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { DashboardLayout } from "./layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Courses from "./pages/Courses";
import Announcements from "./pages/Announcements";
import UserLogin from "./components/UserLogin";
import { useAuth } from "./context/AuthContext";

const App = () => {
  const { currentUser } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<UserLogin />} />

        {/* ✅ Wrap authenticated routes in a layout */}
        <Route
          path="/*"
          element={
            currentUser ? (
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/announcements" element={<Announcements />} />
                </Routes>
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
