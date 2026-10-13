import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { TeachersPage } from './pages/TeachersPage';
import { CoursesPage } from './pages/CoursesPage';
import { EnrollmentPage } from './pages/EnrollmentPage';
import { AttendancePage } from './pages/AttendancePage';
import { GradesPage } from './pages/GradesPage';
import { StudentPortalPage } from './pages/StudentPortalPage';

const RootRedirect = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Login Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected App Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                {/* Unified Role Dashboard for Admin, Teacher, and Student */}
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route
                  path="/students"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_TEACHER', 'ADMIN', 'TEACHER']}>
                      <StudentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teachers"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_TEACHER', 'ADMIN', 'TEACHER']}>
                      <TeachersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/courses"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_TEACHER', 'ADMIN', 'TEACHER']}>
                      <CoursesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/enrollments"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_TEACHER', 'ADMIN', 'TEACHER']}>
                      <EnrollmentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/attendance"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_TEACHER', 'ADMIN', 'TEACHER']}>
                      <AttendancePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/grades"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_TEACHER', 'ADMIN', 'TEACHER']}>
                      <GradesPage />
                    </ProtectedRoute>
                  }
                />

                {/* Student Portal Routes */}
                <Route
                  path="/portal"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'STUDENT']}>
                      <StudentPortalPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portal/courses"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'STUDENT']}>
                      <StudentPortalPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portal/attendance"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'STUDENT']}>
                      <StudentPortalPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portal/grades"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'STUDENT']}>
                      <StudentPortalPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Catch-all redirect */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
