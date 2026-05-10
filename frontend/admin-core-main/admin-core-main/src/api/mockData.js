export const mockUsers = [
  { id: 1, username: "john_doe", email: "john@example.com", role: "Student", status: "active" },
  { id: 2, username: "jane_smith", email: "jane@example.com", role: "Instructor", status: "active" },
  { id: 3, username: "bob_wilson", email: "bob@example.com", role: "Student", status: "blocked" },
  { id: 4, username: "alice_jones", email: "alice@example.com", role: "Student", status: "active" },
  { id: 5, username: "charlie_b", email: "charlie@example.com", role: "Instructor", status: "active" },
];

export const mockCourses = [
  { id: 1, title: "React Fundamentals", instructor: "Jane Smith", students: 45, status: "Published" },
  { id: 2, title: "Node.js Masterclass", instructor: "Charlie B", students: 32, status: "Published" },
  { id: 3, title: "Python for Beginners", instructor: "Jane Smith", students: 67, status: "Draft" },
  { id: 4, title: "Data Structures & Algorithms", instructor: "Charlie B", students: 28, status: "Published" },
];

export const mockLessons = [
  { id: 1, title: "Introduction to JSX", course: "React Fundamentals", duration: "15 min", order: 1 },
  { id: 2, title: "State and Props", course: "React Fundamentals", duration: "20 min", order: 2 },
  { id: 3, title: "Setting Up Node", course: "Node.js Masterclass", duration: "10 min", order: 1 },
  { id: 4, title: "Express Basics", course: "Node.js Masterclass", duration: "25 min", order: 2 },
  { id: 5, title: "Variables & Types", course: "Python for Beginners", duration: "18 min", order: 1 },
];

export const mockQuizzes = [
  { id: 1, title: "React Basics Quiz", course: "React Fundamentals", questions: 10, duration: "15 min" },
  { id: 2, title: "Node.js Concepts", course: "Node.js Masterclass", questions: 8, duration: "12 min" },
  { id: 3, title: "Python Fundamentals", course: "Python for Beginners", questions: 12, duration: "20 min" },
  { id: 4, title: "DSA Challenge", course: "Data Structures & Algorithms", questions: 15, duration: "30 min" },
];

export const mockStats = {
  totalUsers: 1284,
  totalCourses: 47,
  totalLessons: 312,
  activeToday: 89,
};
