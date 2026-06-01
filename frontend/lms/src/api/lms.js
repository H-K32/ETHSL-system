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

export const updateProfile = (formData) =>
  api.patch('/users/profile/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then((r) => r.data)

//certificates
export const getCertificates = () =>
  api.get('/certificates/my-certificates/').then((r) => r.data)
//certificate pdf download
export const getCertificatePdf = (certificateId) =>
  api
    .get(`/certificates/download/${certificateId}/`, { responseType: 'blob' })
    .then((r) => r.data)

export const completeLesson = (lessonId) =>
  api.post(`/progress/complete-lesson/${lessonId}/`).then(r => r.data)

export const getPlacementQuiz = (level) =>
  api.get(`/users/placement/?level=${level}`).then((r) => r.data)

export const submitPlacement = (quizId, answers, desiredLevel) =>
  api.post('/users/placement/submit/', {
    quiz_id: quizId,
    answers: answers,
    desired_level: desiredLevel
  }).then((r) => r.data)

export const submitQuiz = (quizId, answers) =>
  api.post('/progress/submit-quiz/', {
    quiz: quizId,
    answers
  }).then(r => r.data)

export const getUserDashboard = () =>
  api.get('/progress/profile/dashboard/').then(r => r.data)

export const getCurriculum = () =>
  api.get('/courses/learner/curriculum/').then((r) => r.data)