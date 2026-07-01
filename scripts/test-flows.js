const baseUrl = 'http://localhost:3000';

async function request(path, method = 'GET', body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function runTests() {
  console.log("=== Starting QA Flows ===");
  
  // 1. Login as Lecturer
  let res = await request('/api/auth/login', 'POST', { email: 'lecturer@example.com', password: 'password123' });
  if (res.status !== 200) {
    res = await request('/api/auth/login', 'POST', { email: 'lecturer@example.com', password: '123456' });
  }
  const lecturerToken = res.data.data.accessToken;
  const lecturerId = res.data.data.user.id;
  console.log("Lecturer logged in. Token length:", lecturerToken.length);

  // 2. Lecturer create/publish test
  res = await request('/api/exams', 'GET', null, lecturerToken);
  if (!res.data || !res.data.data || !res.data.data.exams || res.data.data.exams.length === 0) {
    console.error("No exams found for lecturer!", res);
    return;
  }
  let examId = res.data.data.exams[0].id;
  console.log("Lecturer retrieved exams. Selected exam:", examId);

  // 3. Login as Student
  res = await request('/api/auth/login', 'POST', { email: 'student@example.com', password: 'password123' });
  if (res.status !== 200) {
    res = await request('/api/auth/login', 'POST', { email: 'student@example.com', password: '123456' });
  }
  const studentToken = res.data.data.accessToken;
  const studentId = res.data.data.user.id;
  console.log("Student logged in. Token length:", studentToken.length);

  // 4. Student fetch published tests
  res = await request('/api/student/exams', 'GET', null, studentToken);
  console.log("Student retrieved published exams. Count:", res.data.data.exams ? res.data.data.exams.length : 0);

  // 5. Student load test questions
  res = await request(`/api/student/exams/${examId}`, 'GET', null, studentToken);
  const examData = res.data.data.exam || {};
  console.log("Student loaded exam details. Questions:", examData.questions ? examData.questions.length : 0);
  const questions = examData.questions || [];
  
  // Find an open text question if exists
  const openQ = questions.find(q => q.type === 'open_text');

  // 6. Autosave draft
  const answers = [
    { question_id: questions[0].id, answer: '4' },
    ...(openQ ? [{ question_id: openQ.id, answer: 'My initial draft' }] : [])
  ];
  res = await request(`/api/student/exams/${examId}/draft`, 'PUT', { answers }, studentToken);
  console.log("Student autosaved draft. Status:", res.status);

  // 7. Load draft
  res = await request(`/api/student/exams/${examId}/draft`, 'GET', null, studentToken);
  console.log("Student loaded draft. Draft answers count:", res.data.data.draft.answers.length);

  // 8. Submit exam
  const finalAnswers = [
    { question_id: questions[0].id, answer: '4' },
    ...(openQ ? [{ question_id: openQ.id, answer: 'My final answer' }] : [])
  ];
  res = await request('/api/student/submissions', 'POST', { exam_id: examId, answers: finalAnswers, time_spent_minutes: 10 }, studentToken);
  let submissionId;
  if (res.status === 409) {
    console.log("Student already submitted exam (Verification PASSED). Fetching existing submission.");
    const existing = await request('/api/student/submissions', 'GET', null, studentToken);
    submissionId = existing.data.data.submissions.find(s => s.exam_id === examId).id;
  } else {
    console.log("Student submitted exam. Auto-grade score:", res.data.data.submission.score);
    submissionId = res.data.data.submission.id;
  }

  // 9. Load draft after submit (should be null)
  res = await request(`/api/student/exams/${examId}/draft`, 'GET', null, studentToken);
  console.log("Student loaded draft after submit. Draft is:", res.data.data.draft);

  // 10. Lecturer load submissions
  res = await request(`/api/lecturer/submissions`, 'GET', null, lecturerToken);
  console.log("Lecturer loaded submissions. Count:", res.data.data.submissions ? res.data.data.submissions.length : 0);

  if (openQ) {
    // 11. Lecturer grades open question
    console.log("Lecturer grading open question manually...");
    res = await request(`/api/lecturer/submissions/${submissionId}/grade`, 'PATCH', { question_id: openQ.id, points_earned: 10, feedback: 'Great job' }, lecturerToken);
    console.log("Manual grade saved. New score:", res.data.data.submission.score);

    // 12. Student views grades
    res = await request('/api/student/submissions', 'GET', null, studentToken);
    const sub = res.data.data.submissions.find(s => s.id === submissionId);
    console.log("Student views updated grade. Score:", sub.score);
  }

  console.log("=== All QA Flows Completed ===");
}

runTests().catch(console.error);
