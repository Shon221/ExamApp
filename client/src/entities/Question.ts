import type { QuestionType } from './enums';

export interface IQuestionData {
  id: string;
  examId: string;
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  order: number;
}

export class Question {
  readonly id: string;
  examId: string;
  text: string;
  type: QuestionType;
  points: number;
  order: number;
  options: string[];
  correctAnswer?: string | string[];

  constructor(
    id: string,
    examId: string,
    text: string,
    type: QuestionType,
    points: number,
    order: number,
    options: string[] = [],
    correctAnswer?: string | string[],
  ) {
    this.id = id;
    this.examId = examId;
    this.text = text;
    this.type = type;
    this.points = points;
    this.order = order;
    this.options = options;
    this.correctAnswer = correctAnswer;
  }

  static fromData(data: IQuestionData): Question {
    return new Question(
      data.id,
      data.examId,
      data.text,
      data.type,
      data.points,
      data.order,
      data.options ?? [],
      data.correctAnswer,
    );
  }

  toData(): IQuestionData {
    return {
      id: this.id,
      examId: this.examId,
      text: this.text,
      type: this.type,
      options: this.options.length ? this.options : undefined,
      correctAnswer: this.correctAnswer,
      points: this.points,
      order: this.order,
    };
  }
}
