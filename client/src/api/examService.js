import { mockDb } from './mockDb';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getAllExams = async () => {
  await delay(500);
  return [...mockDb.exams];
};

export const getExamById = async (id) => {
  await delay(500);
  const exam = mockDb.exams.find(e => e.id === id);
  if (!exam) throw new Error("Exam not found");
  return { ...exam };
};

export const createExam = async (exam) => {
  await delay(800);
  const newExam = { ...exam, id: Date.now().toString() };
  mockDb.exams.push(newExam);
  return newExam;
};

export const getStudentScores = async () => {
  await delay(500);
  return [...mockDb.studentScores];
};
