// src/services/examService.js
// Thin compatibility layer over the PostgreSQL exam repository.

const examsRepository = require('../repositories/examsRepository');

const getExamsByLecturer = (lecturerId) => {
  return examsRepository.getExamsByLecturer(lecturerId);
};

const getExamById = (examId) => {
  return examsRepository.getExamById(examId);
};

const getPublishedExams = () => {
  return examsRepository.getPublishedExams();
};

const createExam = (examData, lecturerId) => {
  return examsRepository.createExam(examData, lecturerId);
};

const updateExam = (examId, updates) => {
  return examsRepository.updateExam(examId, updates);
};

const updateExamStatus = (examId, status) => {
  return examsRepository.updateExamStatus(examId, status);
};

const deleteExam = (examId) => {
  return examsRepository.deleteExam(examId);
};

module.exports = {
  getExamsByLecturer,
  getExamById,
  getPublishedExams,
  createExam,
  updateExam,
  updateExamStatus,
  deleteExam,
};
