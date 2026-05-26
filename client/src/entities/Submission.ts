import type { SubmissionStatus } from './enums';
import { SubmissionStatus as SubmissionStatusConst } from './enums';

export interface IAnswerData {
  questionId: string;
  value: string | string[];
}

export interface ISubmissionData {
  id: string;
  examId: string;
  studentId: string;
  answers: IAnswerData[];
  status: SubmissionStatus;
  submittedAt?: string;
  score?: number;
  feedback?: string;
}

export class Submission {
  readonly id: string;
  examId: string;
  studentId: string;
  answers: IAnswerData[];
  status: SubmissionStatus;
  submittedAt?: string;
  score?: number;
  feedback?: string;

  constructor(
    id: string,
    examId: string,
    studentId: string,
    answers: IAnswerData[],
    status: SubmissionStatus,
    submittedAt?: string,
    score?: number,
    feedback?: string,
  ) {
    this.id = id;
    this.examId = examId;
    this.studentId = studentId;
    this.answers = answers;
    this.status = status;
    this.submittedAt = submittedAt;
    this.score = score;
    this.feedback = feedback;
  }

  static fromData(data: ISubmissionData): Submission {
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

  toData(): ISubmissionData {
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

  isGraded(): boolean {
    return this.status === SubmissionStatusConst.Graded;
  }
}
