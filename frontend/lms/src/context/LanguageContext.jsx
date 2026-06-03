import { createContext, useContext, useCallback } from 'react'
import { useAuth } from './AuthContext.jsx'
import api from '../api/client.js'

const translations = {
  en: {
    // Nav
    dashboard: 'Dashboard',
    levels: 'Levels',
    curriculum: 'Curriculum',
    progress: 'Progress',
    certificates: 'Certificates',
    community: 'Community',
    notifications: 'Notifications',
    profile: 'Profile',
    logout: 'Logout',

    // Dashboard
    curriculumFlow: 'Curriculum Flow',
    learner: 'Learner',
    progressTracker: 'Progress Tracker',
    welcomeBack: 'Welcome back',
    continueJourney: 'Continue your learning journey. Keep improving step by step.',
    completedLessons: 'Completed Lessons',
    successfulQuizzes: 'Successful Quizzes',
    failedQuizzes: 'Failed Quizzes',
    avgQuizScore: 'Avg Quiz Score',
    streak: 'Streak',
    recentActivities: 'Recent Activities',
    viewAll: 'View All →',
    noRecentActivity: 'No recent activity yet. Start learning!',
    recommended: 'Recommended',
    completeForRecommendations: 'Complete lessons to get recommendations.',
    quickActions: 'Quick Actions',
    continueLearning: '📖 Continue Learning',
    viewProgress: '📊 View Progress',
    retakeLevel: '🔄 Retake Level',
    day: 'day',
    days: 'days',

    // Levels
    structuredPathway: 'Structured Pathway',
    proficiencyLevels: 'Proficiency Levels',
    academicProgress: 'Academic Progress',
    unlockedLevels: 'Active Levels',
    pathwayMetrics: 'Pathway Metrics',
    chapter: 'Chapter',
    locked: 'Locked',
    active: 'Active',
    lockedContent: 'Locked Content',
    beginJourney: 'Begin Journey',
    takeLevelQuiz: 'Take Level Quiz',
    noLevelsFound: 'No levels found',

    // Courses
    availableModules: 'Available Modules',
    selectModule: 'Select a module to start learning',
    backToLevels: 'Back to Levels',
    viewLessons: 'View Lessons',
    noModules: 'No modules available',

    // Lessons
    yourLearningPath: 'Your Learning Path',
    workThroughLessons: 'Work through each lesson in order — unlock the next as you complete them.',
    backToModules: '← Back to Modules',
    open: 'Open',
    completed: 'Completed',
    noLessons: 'No lessons in this module yet',

    // Lesson Detail
    lesson: 'Lesson',
    backToModule: '← Back to module',
    markComplete: 'Mark as complete',
    saving: 'Saving…',
    takeQuiz: 'Take quiz →',
    askAiTutor: 'Ask AI Tutor',
    closeTutor: 'Close Tutor',
    askMeAnything: 'Ask me anything about this lesson!',
    thinking: 'Thinking…',
    send: 'Send',
    askQuestion: 'Ask a question…',

    // Progress
    yourLearningProgress: 'Your Learning Progress',
    trackYourJourney: 'Track your journey, monitor your habits, and record your achievements.',
    yourCurrentLevel: 'Your Current Level',
    passedQuizzes: 'Passed Quizzes',
    successRate: 'Success Rate',
    streakDays: 'Streak Days',
    quizPerformance: 'Quiz Performance',
    totalQuizAttempts: 'Total Quiz Attempts',
    quizSuccessRate: 'Quiz Success Rate',
    takeMoreQuizzes: 'Take More Quizzes',
    learningSummary: 'Learning Summary',
    lessonsCompleted: 'Lessons Completed',
    studyStreak: 'Study Streak',
    readyForNewLessons: 'Ready to start new lessons?',
    exploreNow: 'Start Now →',

    // Community
    communityHub: 'Community Hub',
    connectShareLearn: 'Connect, share, and learn together',
    newDiscussion: 'New Discussion',
    reportsAgainstMe: 'Reports Against Me',
    noPostsYet: 'No posts yet. Be the first to start a discussion!',
    comments: 'comments',
    postReply: 'Post Reply',
    writeReply: 'Write a reply...',
    createDiscussion: 'Create New Discussion',
    title: 'Title',
    content: 'Content',
    cancel: 'Cancel',
    post: 'Post Discussion',
    edit: 'Edit',
    delete: 'Delete',
    report: 'Report',

    // Notifications
    notifications_title: 'Notifications',
    stayUpdated: 'Stay updated with warnings and reports',
    warnings: 'Warnings',
    reportsAgainstYou: 'Reports Against You',
    noWarnings: 'No Warnings',
    noWarningsMsg: 'You have no warnings. Keep up the good work!',

    // Profile
    editProfile: 'Edit Profile',
    changePassword: 'Change Password',
    courseProgress: 'Course Progress',
    noProgressYet: 'No course progress yet. Start learning to see your progress!',
    quizAverage: 'Quiz Average',
    currentLevel: 'Current Level',

    // Common
    loading: 'Loading...',
    retry: 'Try Again',
    save: 'Save Changes',
    returnToDashboard: 'Return to Dashboard',
  },

  am: {
    // Nav
    dashboard: 'ዳሽቦርድ',
    levels: 'ደረጃዎች',
    curriculum: 'ስርዓተ ትምህርት',
    progress: 'እድገት',
    certificates: 'የምስክር ወረቀቶች',
    community: 'ማህበረሰብ',
    notifications: 'ማሳወቂያዎች',
    profile: 'መገለጫ',
    logout: 'ውጣ',

    // Dashboard
    curriculumFlow: 'የትምህርት ፍሰት',
    learner: 'ተማሪ',
    progressTracker: 'የእድገት መቆጣጠሪያ',
    welcomeBack: 'እንኳን ደህና መጡ',
    continueJourney: 'የትምህርት ጉዞዎን ይቀጥሉ። እርምጃ በእርምጃ እያሻሻሉ ይሂዱ።',
    completedLessons: 'የተጠናቀቁ ትምህርቶች',
    successfulQuizzes: 'የተሳኩ ፈተናዎች',
    failedQuizzes: 'ያልተሳኩ ፈተናዎች',
    avgQuizScore: 'አማካይ የፈተና ነጥብ',
    streak: 'ተከታታይ ቀናት',
    recentActivities: 'የቅርብ ጊዜ እንቅስቃሴዎች',
    viewAll: 'ሁሉንም ይዩ →',
    noRecentActivity: 'እስካሁን ምንም እንቅስቃሴ የለም። መማር ይጀምሩ!',
    recommended: 'የሚመከር',
    completeForRecommendations: 'ምክሮችን ለማግኘት ትምህርቶችን ያጠናቅቁ።',
    quickActions: 'ፈጣን እርምጃዎች',
    continueLearning: '📖 መማርን ይቀጥሉ',
    viewProgress: '📊 እድገት ይመልከቱ',
    retakeLevel: '🔄 ደረጃ ይድገሙ',
    day: 'ቀን',
    days: 'ቀናት',

    // Levels
    structuredPathway: 'የተደራጀ መንገድ',
    proficiencyLevels: 'የብቃት ደረጃዎች',
    academicProgress: 'የትምህርት እድገት',
    unlockedLevels: 'ንቁ ደረጃዎች',
    pathwayMetrics: 'የመንገድ መለኪያዎች',
    chapter: 'ምዕራፍ',
    locked: 'ተቆልፏል',
    active: 'ንቁ',
    lockedContent: 'ተቆልፏል',
    beginJourney: 'ጉዞ ይጀምሩ',
    takeLevelQuiz: 'የደረጃ ፈተና ይውሰዱ',
    noLevelsFound: 'ምንም ደረጃ አልተገኘም',

    // Courses
    availableModules: 'ሞጁሎች',
    selectModule: 'ለመማር ሞጁል ይምረጡ',
    backToLevels: 'ወደ ደረጃዎች ተመለስ',
    viewLessons: 'ትምህርቶችን ይዩ',
    noModules: 'ምንም ሞጁሎች የሉም',

    // Lessons
    yourLearningPath: 'የትምህርት መንገድዎ',
    workThroughLessons: 'እያንዳንዱን ትምህርት በቅደም ተከተል ይስሩ — ሲጠናቀቁ ቀጣዩን ይክፈቱ።',
    backToModules: '← ወደ ሞጁሎች ተመለስ',
    open: 'ክፍት',
    completed: 'ተጠናቅቋል',
    noLessons: 'እስካሁን ምንም ትምህርቶች የሉም',

    // Lesson Detail
    lesson: 'ትምህርት',
    backToModule: '← ወደ ሞጁሉ ተመለስ',
    markComplete: 'እንደተጠናቀቀ ምልክት አድርግ',
    saving: 'በመቀመጥ ላይ…',
    takeQuiz: 'ፈተና ውሰድ →',
    askAiTutor: 'AI አስተማሪን ይጠይቁ',
    closeTutor: 'አስተማሪ ዝጋ',
    askMeAnything: 'ስለዚህ ትምህርት ማንኛውም ነገር ይጠይቁኝ!',
    thinking: 'በማሰብ ላይ…',
    send: 'ላክ',
    askQuestion: 'ጥያቄ ይጠይቁ…',

    // Progress
    yourLearningProgress: 'የትምህርት እድገትዎ',
    trackYourJourney: 'ጉዞዎን ይከታተሉ፣ ልምዶቻቸውን ይቆጣጠሩ፣ ስኬቶቻቸውን ይመዝግቡ።',
    yourCurrentLevel: 'የአሁን ደረጃዎ',
    passedQuizzes: 'ያለፉ ፈተናዎች',
    successRate: 'ስኬት ደረጃ',
    streakDays: 'ተከታታይ ቀናት',
    quizPerformance: 'የፈተና አፈፃፀም',
    totalQuizAttempts: 'ጠቅላላ የፈተና ሙከራዎች',
    quizSuccessRate: 'የፈተና ስኬት ደረጃ',
    takeMoreQuizzes: 'ተጨማሪ ፈተናዎች ውሰዱ',
    learningSummary: 'የትምህርት ማጠቃለያ',
    lessonsCompleted: 'የተጠናቀቁ ትምህርቶች',
    studyStreak: 'የጥናት ተከታታይ ቀናት',
    readyForNewLessons: 'አዲስ ትምህርቶች ለመጀመር ዝግጁ ነዎት?',
    exploreNow: 'አሁን ይጀምሩ →',

    // Community
    communityHub: 'የማህበረሰብ ማዕከል',
    connectShareLearn: 'ተገናኙ፣ ያካፍሉ፣ አብረው ይማሩ',
    newDiscussion: 'አዲስ ውይይት',
    reportsAgainstMe: 'ስለ እኔ ሪፖርቶች',
    noPostsYet: 'እስካሁን ምንም ልጥፍ የለም። የመጀመሪያው ውይይት ይጀምሩ!',
    comments: 'አስተያየቶች',
    postReply: 'ምላሽ ይስጡ',
    writeReply: 'ምላሽ ይጻፉ...',
    createDiscussion: 'አዲስ ውይይት ፍጠር',
    title: 'ርዕስ',
    content: 'ይዘት',
    cancel: 'ሰርዝ',
    post: 'ውይይት ይለጥፉ',
    edit: 'አስተካክል',
    delete: 'ሰርዝ',
    report: 'ሪፖርት',

    // Notifications
    notifications_title: 'ማሳወቂያዎች',
    stayUpdated: 'ማስጠንቀቂያዎችን እና ሪፖርቶችን ይከታተሉ',
    warnings: 'ማስጠንቀቂያዎች',
    reportsAgainstYou: 'ስለ እርስዎ ሪፖርቶች',
    noWarnings: 'ምንም ማስጠንቀቂያ የለም',
    noWarningsMsg: 'ምንም ማስጠንቀቂያ የለዎትም። እያሻሻሉ ይቀጥሉ!',

    // Profile
    editProfile: 'መገለጫ አስተካክል',
    changePassword: 'የይለፍ ቃል ቀይር',
    courseProgress: 'የኮርስ እድገት',
    noProgressYet: 'እስካሁን ምንም የኮርስ እድገት የለም። ለማየት መማር ይጀምሩ!',
    quizAverage: 'አማካይ ፈተና',
    currentLevel: 'የአሁን ደረጃ',

    // Common
    loading: 'በመጫን ላይ...',
    retry: 'እንደገና ሞክር',
    save: 'ለውጦችን አስቀምጥ',
    returnToDashboard: 'ወደ ዳሽቦርድ ተመለስ',
  },
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const { user } = useAuth()
  const lang = user?.language || 'en'

  const t = useCallback((key) => translations[lang]?.[key] ?? translations.en[key] ?? key, [lang])

  const toggleLanguage = useCallback(async () => {
    const newLang = lang === 'en' ? 'am' : 'en'
    try {
      await api.patch('/users/profile/', { language: newLang })
      // Reload the page so AuthContext re-fetches user with new language
      window.location.reload()
    } catch {
      // silently ignore
    }
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
