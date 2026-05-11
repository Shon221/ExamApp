import React, { useState, useEffect } from 'react';
import * as examService from '../api/examService';

const TeacherDashboard = () => {
  // מערך לאחסון כל המבחנים שיחזרו מהשרת
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hook שמאפשר להריץ קוד מיד כשהקומפוננטה עולה למסך (Mounting)
  useEffect(() => {
    // הגדרת פונקציה פנימית אסינכרונית למשיכת המידע
    const fetchExams = async () => {
      try {
        // קריאה לשירות שמחזיר את כל המבחנים
        const data = await examService.getAllExams();
        // עדכון ה-State עם הנתונים שהתקבלו
        setExams(data);
      } catch (error) {
        console.error("Failed to fetch exams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h2 className="mb-0">Teacher Dashboard</h2>
          <button className="btn btn-light btn-sm">Create New Exam</button>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="list-group">
              {exams.map((exam) => (
                <div key={exam.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">{exam.title}</h5>
                    <small className="text-muted">ID: {exam.id} | {exam.questions.length} Questions</small>
                  </div>
                  <div>
                    <button className="btn btn-outline-info btn-sm me-2">View Results</button>
                    <button className="btn btn-outline-danger btn-sm">Delete</button>
                  </div>
                </div>
              ))}
              {exams.length === 0 && <p className="text-center mt-3">No exams available.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
