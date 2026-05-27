import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Placement from './pages/Placement.jsx'
import Levels from './pages/Levels.jsx'
import Courses from './pages/Courses.jsx'
import Lessons from './pages/Lessons.jsx'
import LessonDetail from './pages/LessonDetail.jsx'
import Quiz from './pages/Quiz.jsx'
import Profile from './pages/Profile.jsx'
import Progress from './pages/Progress.jsx'
import Community from './pages/Community.jsx'
import Notifications from './pages/Notifications.jsx'
import NotFound from './pages/NotFound.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import Certificates from './pages/learner/Certificates.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import CompleteProfile from './pages/CompleteProfile.jsx'

export default function App() {
  return (
 <Routes>

      {/* ================= PUBLIC AUTH PAGES ================= */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
      </Route>

      {/* ================= MAIN APP (WITH NAVBAR/LAYOUT) ================= */}
      <Route element={<Layout />}>

        <Route path="/" element={<Home />} />

        {/* ================= PROTECTED ROUTES ================= */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div />} />
          <Route path="/placement" element={<Placement />} />
          <Route path="/levels" element={<Levels />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/community" element={<Community />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/courses/:levelId" element={<Courses />} />
          <Route path="/lessons/:courseId" element={<Lessons />} />
          <Route path="/lesson/:id" element={<LessonDetail />} />
          <Route path="/quiz/:id" element={<Quiz />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/certificates" element={<Certificates />} />
        </Route>

      </Route>

      {/* ================= 404 ================= */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  )
}