import { useState } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import PrivateRoute from "./components/PrivateRoute";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ManageUsers from "./pages/ManageUsers";
import ManageCourses from "./pages/ManageCourses";
import ManageLessons from "./pages/ManageLessons";
import ManageQuizzes from "./pages/ManageQuizzes";
import AdminProfile from "./pages/AdminProfile";
import AdminForgotPassword from "./pages/AdminForgotPassword";
import AdminResetPassword from "./pages/AdminResetPassword";
import ReportedUsers from "./pages/ReportedUsers";
import ReportDetails from "./pages/ReportDetails";
import AdminVerifyEmailChange from "./pages/AdminVerifyEmailChange";

// Shared layout for all protected admin pages
function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main">
        <Navbar onMenuClick={() => setSidebarOpen(o => !o)} />
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}

const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/admin-forgot-password" element={<AdminForgotPassword />} />
      <Route path="/admin-reset-password/:uidb64/:token" element={<AdminResetPassword />} />
      <Route path="/verify-email-change/:uidb64/:token" element={<AdminVerifyEmailChange />} />

      {/* Protected — all wrapped in AdminLayout */}
      <Route path="/dashboard" element={<PrivateRoute><AdminLayout><Dashboard /></AdminLayout></PrivateRoute>} />
      <Route path="/users"     element={<PrivateRoute><AdminLayout><ManageUsers /></AdminLayout></PrivateRoute>} />
      <Route path="/courses"   element={<PrivateRoute><AdminLayout><ManageCourses /></AdminLayout></PrivateRoute>} />
      <Route path="/lessons"   element={<PrivateRoute><AdminLayout><ManageLessons /></AdminLayout></PrivateRoute>} />
      <Route path="/quizzes"   element={<PrivateRoute><AdminLayout><ManageQuizzes /></AdminLayout></PrivateRoute>} />
      <Route path="/profile"         element={<PrivateRoute><AdminLayout><AdminProfile /></AdminLayout></PrivateRoute>} />
      <Route path="/reported-users"   element={<PrivateRoute><AdminLayout><ReportedUsers /></AdminLayout></PrivateRoute>} />
      <Route path="/reported-users/:userId" element={<PrivateRoute><AdminLayout><ReportDetails /></AdminLayout></PrivateRoute>} />

      <Route path="/"  element={<Navigate to="/login" replace />} />
      <Route path="*"  element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
