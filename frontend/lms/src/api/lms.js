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

//certificates
export const getCertificates = () =>
  api.get('/certificates/my-certificates/').then((r) => r.data)
//certificate pdf download
export const getCertificatePdf = (certificateId) =>
  api
    .get(`/certificates/download/${certificateId}/`, { responseType: 'blob' })
    .then((r) => r.data)

export const completeLesson = async () => ({ success: true })

export const getPlacementQuiz = async () => ([])

export const submitPlacement = async () => ({ success: true })

export const submitQuiz = async () => ({ success: true })