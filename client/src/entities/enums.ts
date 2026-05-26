export const UserRole = {
  Teacher: 'teacher',
  Student: 'student',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const QuestionType = {
  MultipleChoice: 'multiple_choice',
  TrueFalse: 'true_false',
  OpenText: 'open_text',
} as const;
export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];

export const ExamStatus = {
  Draft: 'draft',
  Published: 'published',
  Closed: 'closed',
} as const;
export type ExamStatus = (typeof ExamStatus)[keyof typeof ExamStatus];

export const SubmissionStatus = {
  InProgress: 'in_progress',
  Submitted: 'submitted',
  Graded: 'graded',
} as const;
export type SubmissionStatus = (typeof SubmissionStatus)[keyof typeof SubmissionStatus];
