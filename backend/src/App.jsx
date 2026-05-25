import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';
import { Box, CircularProgress } from '@mui/material';

import Login          from './pages/auth/Login';
import Register       from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword  from './pages/auth/ResetPassword';

import StudentDashboard    from './pages/student/Dashboard';
import StudentCourses      from './pages/student/Courses';
import StudentCourseDetail from './pages/student/CourseDetail';
import StudentLearn        from './pages/student/Learn';
import StudentAssignments  from './pages/student/Assignments';
import StudentQuizzes      from './pages/student/Quizzes';
import StudentProgress     from './pages/student/Progress';
import StudentProfile      from './pages/student/Profile';
import StudentAnalytics    from './pages/student/Analytics';

import InstructorDashboard    from './pages/instructor/Dashboard';
import InstructorCourses      from './pages/instructor/Courses';
import InstructorCourseDetail from './pages/instructor/CourseDetail';
import InstructorAssignments  from './pages/instructor/Assignments';
import InstructorQuizzes      from './pages/instructor/Quizzes';
import InstructorAnalytics    from './pages/instructor/Analytics';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers     from './pages/admin/Users';
import AdminCourses   from './pages/admin/Courses';
import AdminAnalytics from './pages/admin/Analytics';
import AdminSettings  from './pages/admin/Settings';

import ProfilePage from './pages/ProfilePage';

function FullPageLoader() {
  return (
    <Box sx={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <CircularProgress size={48}/>
    </Box>
  );
}

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader/>;
  if (!user)   return <Navigate to="/login" replace/>;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to={`/${user.role}/dashboard`} replace/>;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader/>;
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login"           element={!user ? <Login/>          : <Navigate to={`/${user.role}/dashboard`} replace/>}/>
      <Route path="/register"        element={!user ? <Register/>       : <Navigate to={`/${user.role}/dashboard`} replace/>}/>
      <Route path="/forgot-password" element={<ForgotPassword/>}/>
      <Route path="/reset-password/:token" element={<ResetPassword/>}/>
      <Route path="/profile"         element={<PrivateRoute><ProfilePage/></PrivateRoute>}/>

      {/* Student */}
      <Route path="/student/dashboard"        element={<PrivateRoute allowedRoles={['student']}><StudentDashboard/></PrivateRoute>}/>
      <Route path="/student/courses"          element={<PrivateRoute allowedRoles={['student']}><StudentCourses/></PrivateRoute>}/>
      <Route path="/student/course/:courseId" element={<PrivateRoute allowedRoles={['student']}><StudentCourseDetail/></PrivateRoute>}/>
      <Route path="/student/learn/:courseId"  element={<PrivateRoute allowedRoles={['student']}><StudentLearn/></PrivateRoute>}/>
      <Route path="/student/assignments"      element={<PrivateRoute allowedRoles={['student']}><StudentAssignments/></PrivateRoute>}/>
      <Route path="/student/quizzes"          element={<PrivateRoute allowedRoles={['student']}><StudentQuizzes/></PrivateRoute>}/>
      <Route path="/student/progress"         element={<PrivateRoute allowedRoles={['student']}><StudentProgress/></PrivateRoute>}/>
      <Route path="/student/profile"          element={<PrivateRoute allowedRoles={['student']}><StudentProfile/></PrivateRoute>}/>
      <Route path="/student/analytics"        element={<PrivateRoute allowedRoles={['student']}><StudentAnalytics/></PrivateRoute>}/>

      {/* Instructor */}
      <Route path="/instructor/dashboard"        element={<PrivateRoute allowedRoles={['instructor']}><InstructorDashboard/></PrivateRoute>}/>
      <Route path="/instructor/courses"          element={<PrivateRoute allowedRoles={['instructor']}><InstructorCourses/></PrivateRoute>}/>
      <Route path="/instructor/course/:courseId" element={<PrivateRoute allowedRoles={['instructor']}><InstructorCourseDetail/></PrivateRoute>}/>
      <Route path="/instructor/assignments"      element={<PrivateRoute allowedRoles={['instructor']}><InstructorAssignments/></PrivateRoute>}/>
      <Route path="/instructor/quizzes"          element={<PrivateRoute allowedRoles={['instructor']}><InstructorQuizzes/></PrivateRoute>}/>
      <Route path="/instructor/analytics"        element={<PrivateRoute allowedRoles={['instructor']}><InstructorAnalytics/></PrivateRoute>}/>

      {/* Admin */}
      <Route path="/admin/dashboard" element={<PrivateRoute allowedRoles={['admin']}><AdminDashboard/></PrivateRoute>}/>
      <Route path="/admin/users"     element={<PrivateRoute allowedRoles={['admin']}><AdminUsers/></PrivateRoute>}/>
      <Route path="/admin/courses"   element={<PrivateRoute allowedRoles={['admin']}><AdminCourses/></PrivateRoute>}/>
      <Route path="/admin/analytics" element={<PrivateRoute allowedRoles={['admin']}><AdminAnalytics/></PrivateRoute>}/>
      <Route path="/admin/settings"  element={<PrivateRoute allowedRoles={['admin']}><AdminSettings/></PrivateRoute>}/>

      <Route path="/"  element={<Navigate to="/login" replace/>}/>
      <Route path="*"  element={<Navigate to="/login" replace/>}/>
    </Routes>
  );
}

export default function App() {
  return (
    <AppThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes/>
          <ToastContainer
            position="top-right"
            autoClose={3500}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            draggable
            theme="light"
            toastStyle={{
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </AppThemeProvider>
  );
}
