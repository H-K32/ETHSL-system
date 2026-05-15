import api from './client.js'

export const getLevels = () => api.get('/levels/').then((r) => r.data)
export const getCourses = (levelId) =>
  api.get(`/courses/`, { params: { level: levelId } }).then((r) => r.data)
export const getLessons = (courseId) =>
  api.get(`/lessons/`, { params: { course: courseId } }).then((r) => r.data)
export const getLesson = (id) => api.get(`/lessons/${id}/`).then((r) => r.data)
export const completeLesson = (id) =>
  api.post(`/lessons/${id}/complete/`).then((r) => r.data)

export const getQuiz = (id) => api.get(`/quizzes/${id}/`).then((r) => r.data)
export const submitQuiz = (id, answers) =>
  api.post(`/quizzes/${id}/submit/`, { answers }).then((r) => r.data)

export const getPlacementQuiz = () => api.get(`/placement/`).then((r) => r.data)
export const submitPlacement = (answers) =>
  api.post(`/placement/submit/`, { answers }).then((r) => r.data)

export const getProfile = () => api.get('/profile/').then((r) => r.data)
