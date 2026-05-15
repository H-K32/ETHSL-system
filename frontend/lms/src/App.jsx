import { Routes, Route, Navigate } from 'react-router-dom'
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
import NotFound from './pages/NotFound.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/placement" element={<Placement />} />
          <Route path="/levels" element={<Levels />} />
          <Route path="/courses/:levelId" element={<Courses />} />
          <Route path="/lessons/:courseId" element={<Lessons />} />
          <Route path="/lesson/:id" element={<LessonDetail />} />
          <Route path="/quiz/:id" element={<Quiz />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
