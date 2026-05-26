import { describe, it, expect } from 'vitest';
import { getAllExams, createExam } from './examService';

describe('Teacher functionality (examService)', () => {
  it('should fetch all exams', async () => {
    const exams = await getAllExams();
    expect(Array.isArray(exams)).toBe(true);
    expect(exams.length).toBeGreaterThan(0);
    expect(exams[0]).toHaveProperty('title');
  });

  it('should create a new exam', async () => {
    const newExamData = {
      title: 'New Test Exam',
      questions: [{ id: 'q1', text: 'Test?', options: ['Yes', 'No'], correct: 0 }]
    };
    
    const createdExam = await createExam(newExamData);
    
    expect(createdExam).toHaveProperty('id');
    expect(createdExam.title).toBe('New Test Exam');
    
    const allExams = await getAllExams();
    const found = allExams.find(e => e.id === createdExam.id);
    expect(found).toBeDefined();
  });
});
