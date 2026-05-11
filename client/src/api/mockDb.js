export const mockDb = {
  exams: [
    {
      id: "1",
      title: "JavaScript Basics",
      questions: [
        { id: "q1", text: "What is closure?", options: ["a", "b", "c"], correct: 0 },
        { id: "q2", text: "What is hoisting?", options: ["a", "b", "c"], correct: 1 }
      ]
    },
    {
      id: "2",
      title: "React Fundamentals",
      questions: [
        { id: "q3", text: "What is a hook?", options: ["a", "b", "c"], correct: 2 },
        { id: "q4", text: "What is JSX?", options: ["a", "b", "c"], correct: 0 }
      ]
    }
  ],
  studentScores: [
    { studentName: "Alice", examId: "1", score: 85 },
    { studentName: "Bob", examId: "1", score: 92 }
  ]
};
