import api from './client.js'

 

export const getLevels = () =>
  api.get('/courses/learner/levels/').then((r) => r.data)

export const getCourses = (levelId) =>
  api.get(`/courses/learner/courses/${levelId}/`).then((r) => r.data)

export const getLessons = (courseId) =>
  api.get(`/courses/learner/lessons/${courseId}/`).then((r) => r.data)

export const getLesson = (lessonId) =>
  api.get(`/courses/learner/lesson/${lessonId}/`).then((r) => r.data)

export const getQuiz = (quizId) =>
  api.get(`/courses/learner/quiz/${quizId}/`).then((r) => r.data)

export const getProfile = () =>
  api.get('/users/profile/').then((r) => r.data)