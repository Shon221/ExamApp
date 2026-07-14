import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { UserRole } from '../entities';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { TeacherDashboard } from '../pages/teacher/TeacherDashboard';
import { TeacherExamEditorPage } from '../pages/teacher/TeacherExamEditorPage';
import { TeacherExamsPage } from '../pages/teacher/TeacherExamsPage';
import { TeacherSubmissionsPage } from '../pages/teacher/TeacherSubmissionsPage';
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { StudentExamsPage } from '../pages/student/StudentExamsPage';
import { StudentGradesPage } from '../pages/student/StudentGradesPage';
import { StudentTakeExamPage } from '../pages/student/StudentTakeExamPage';
import { StudentSubmissionReviewPage } from '../pages/student/StudentSubmissionReviewPage';
import { useAuth } from '../hooks/useAuth';

function HomeRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <p className="loading-text">Loading...</p>;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === UserRole.Teacher ? '/teacher' : '/student'} replace />;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomeRedirect />} />

            <Route element={<ProtectedRoute allowedRoles={[UserRole.Teacher]} />}>
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/teacher/exams" element={<TeacherExamsPage />} />
              <Route path="/teacher/exams/new" element={<TeacherExamEditorPage />} />
              <Route path="/teacher/exams/:examId" element={<TeacherExamEditorPage />} />
              <Route path="/teacher/submissions" element={<TeacherSubmissionsPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={[UserRole.Student]} />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/exams" element={<StudentExamsPage />} />
              <Route path="/student/exams/:examId/take" element={<StudentTakeExamPage />} />
              <Route path="/student/grades" element={<StudentGradesPage />} />
              <Route path="/student/submissions/:submissionId/review" element={<StudentSubmissionReviewPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
