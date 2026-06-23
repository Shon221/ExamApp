import { ExamStatus } from './enums';

export class Exam {
  constructor(id, title, description, teacherId, status, durationMinutes, createdAt, publishedAt) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.teacherId = teacherId;
    this.status = status;
    this.durationMinutes = durationMinutes;
    this.createdAt = createdAt;
    this.publishedAt = publishedAt;
  }

  static fromData(data) {
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

  toData() {
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

  isPublished() {
    return this.status === ExamStatus.Published;
  }

  isDraft() {
    return this.status === ExamStatus.Draft;
  }
}
