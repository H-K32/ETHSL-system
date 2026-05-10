import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ManageUsers from "./pages/ManageUsers";
import ManageCourses from "./pages/ManageCourses";
import ManageLessons from "./pages/ManageLessons";
import ManageQuizzes from "./pages/ManageQuizzes";
import AdminProfile from "./pages/AdminProfile";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/users" element={<PrivateRoute><ManageUsers /></PrivateRoute>} />
      <Route path="/courses" element={<PrivateRoute><ManageCourses /></PrivateRoute>} />
      <Route path="/lessons" element={<PrivateRoute><ManageLessons /></PrivateRoute>} />
      <Route path="/quizzes" element={<PrivateRoute><ManageQuizzes /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><AdminProfile /></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
