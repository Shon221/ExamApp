import { SubmissionStatus } from './enums';

export class Submission {
  constructor(id, examId, studentId, answers, status, submittedAt, score, feedback) {
    this.id = id;
    this.examId = examId;
    this.studentId = studentId;
    this.answers = answers;
    this.status = status;
    this.submittedAt = submittedAt;
    this.score = score;
    this.feedback = feedback;
  }

  static fromData(data) {
    return new Submission(
      data.id,
      data.examId,
      data.studentId,
      data.answers,
      data.status,
      data.submittedAt,
      data.score,
      data.feedback,
    );
  }

  toData() {
    return {
      id: this.id,
      examId: this.examId,
      studentId: this.studentId,
      answers: this.answers,
      status: this.status,
      submittedAt: this.submittedAt,
      score: this.score,
      feedback: this.feedback,
    };
  }

  isGraded() {
    return this.status === SubmissionStatus.Graded;
  }
}
