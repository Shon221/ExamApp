import type { ExamStatus } from './enums';
import { ExamStatus as ExamStatusConst } from './enums';

export interface IExamData {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  status: ExamStatus;
  durationMinutes: number;
  createdAt: string;
  publishedAt?: string;
}

export class Exam {
  readonly id: string;
  title: string;
  description: string;
  teacherId: string;
  status: ExamStatus;
  durationMinutes: number;
  createdAt: string;
  publishedAt?: string;

  constructor(
    id: string,
    title: string,
    description: string,
    teacherId: string,
    status: ExamStatus,
    durationMinutes: number,
    createdAt: string,
    publishedAt?: string,
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.teacherId = teacherId;
    this.status = status;
    this.durationMinutes = durationMinutes;
    this.createdAt = createdAt;
    this.publishedAt = publishedAt;
  }

  static fromData(data: IExamData): Exam {
    return new Exam(
      data.id,
      data.title,
      data.description,
      data.teacherId,
      data.status,
      data.durationMinutes,
      data.createdAt,
      data.publishedAt,
    );
  }

  toData(): IExamData {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      teacherId: this.teacherId,
      status: this.status,
      durationMinutes: this.durationMinutes,
      createdAt: this.createdAt,
      publishedAt: this.publishedAt,
    };
  }

  isPublished(): boolean {
    return this.status === ExamStatusConst.Published;
  }

  isDraft(): boolean {
    return this.status === ExamStatusConst.Draft;
  }
}
