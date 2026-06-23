export class Question {
  constructor(id, examId, text, type, points, order, options = [], correctAnswer) {
    this.id = id;
    this.examId = examId;
    this.text = text;
    this.type = type;
    this.points = points;
    this.order = order;
    this.options = options;
    this.correctAnswer = correctAnswer;
  }

  static fromData(data) {
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

  toData() {
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
