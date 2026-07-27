import React from 'react';
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import DashboardLayout from './components/dashboard/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import Support from './pages/Support';
import Features from './pages/Features';
import Privacy from './pages/legal/Privacy';
import Terms from './pages/legal/Terms';
import Cookies from './pages/legal/Cookies';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import ScrollToTop from './components/ScrollToTop';

// Admin
import AdminDashboard from './pages/dashboard/AdminDashboard';
import Payments from './pages/dashboard/shared/Payments';
import SchoolFinances from './pages/dashboard/shared/SchoolFinances';
import AdminUsers from './pages/dashboard/admin/Users';
import AdminSubscriptions from './pages/dashboard/admin/Subscriptions';
import AdminSettings from './pages/dashboard/admin/Settings';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import SubscriptionExpired from './pages/SubscriptionExpired';
import SubscriptionCheckout from './pages/SubscriptionCheckout';

// PDG
import PDGDashboard from './pages/dashboard/PDGDashboard';
import GlobalStats from './pages/dashboard/pdg/GlobalStats';
import Schools from './pages/dashboard/pdg/Schools';
import Finances from './pages/dashboard/pdg/Finances';
import SchoolDetails from './pages/dashboard/pdg/SchoolDetails';
import SelectPlan from './pages/dashboard/pdg/SelectPlan';
import PDGStudents from './pages/dashboard/pdg/Students';
import PDGTeachers from './pages/dashboard/pdg/Teachers';
import Settings from './pages/dashboard/pdg/Settings';

// Direction
import DirectionDashboard from './pages/dashboard/DirectionDashboard';
import DirectionCycles from './pages/dashboard/direction/Cycles';
import DirectionClasses from './pages/dashboard/direction/Classes';
import DirectionSubjects from './pages/dashboard/direction/Subjects';
import Staff from './pages/dashboard/direction/Staff';
import Teachers from './pages/dashboard/direction/Teachers';
import Students from './pages/dashboard/direction/Students';
import Schedule from './pages/dashboard/direction/Schedule';
import Rooms from './pages/dashboard/direction/Rooms';
import Announcements from './pages/dashboard/direction/Announcements';
import TuitionFees from './pages/dashboard/direction/TuitionFees';

// Secretariat
import SecretariatDashboard from './pages/dashboard/SecretariatDashboard';
import Enroll from './pages/dashboard/secretariat/Enroll';
import SecretariatStudents from './pages/dashboard/secretariat/Students';
import Attendance from './pages/dashboard/secretariat/Attendance';

// Teacher
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import Book from './pages/dashboard/teacher/Book';
import Homework from './pages/dashboard/teacher/Homework';
import Grades from './pages/dashboard/teacher/Grades';
import Classes from './pages/dashboard/teacher/Classes';
import TeacherSchedule from './pages/dashboard/teacher/Schedule';
import TeacherAttendance from './pages/dashboard/teacher/Attendance';

// Parent & Student
import ParentDashboard from './pages/dashboard/ParentDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import ParentResults from './pages/dashboard/parent/Results';
import ParentSchedule from './pages/dashboard/parent/Schedule';
import ParentAttendance from './pages/dashboard/parent/Attendance';
import EnrollChild from './pages/dashboard/parent/EnrollChild';
import ExploreSchools from './pages/dashboard/parent/ExploreSchools';
import StudentSchedule from './pages/dashboard/student/Schedule';
import StudentResults from './pages/dashboard/student/Grades';
import StudentHomework from './pages/dashboard/student/Homework';
import StudentCourses from './pages/dashboard/student/Courses';
import ReportCards from './pages/dashboard/ReportCards';

import Messages from './pages/dashboard/messages/index';
import Notifications from './pages/dashboard/Notifications';
import Profile from './pages/dashboard/Profile';
import AcademicYears from './pages/dashboard/shared/AcademicYears';
import JoinGroup from './pages/JoinGroup';
import MobileAnnotationViewer from './pages/MobileAnnotationViewer';
import { ROUTES } from './constants/routes';

// Layout Wrapper for Dashboard to keep Sidebar/Topbar persistent
const DashboardWrapper: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getTitle = () => {
    const path = location.pathname;
    if (path.includes('/messages')) return "Messagerie";
    if (path.includes('/notifications')) return "Notifications";
    if (path.includes('/profile')) return "Mon Profil";
    if (path.includes('/report-cards')) return "Gestion des Bulletins";
    if (path.includes('/teacher')) return "Espace Enseignant";
    if (path.includes('/direction')) return "Espace Direction";
    if (path.includes('/secretariat')) return "Espace Secrétariat";
    if (path.includes('/pdg')) return "Espace PDG";
    if (path.includes('/parent')) return "Espace Parent";
    if (path.includes('/student')) return "Espace Élève";
    return "Tableau de Bord";
  };

  return (
    <DashboardLayout role={user?.role || ''} title={getTitle()}>
      <Outlet />
    </DashboardLayout>
  );
};

const App: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isMobileViewer = location.pathname === '/mobile-viewer';

  const isHome = location.pathname === '/';

  return (
    <div className={`flex flex-col min-h-screen w-full ${isHome ? 'overflow-x-hidden' : ''}`}>
      <ScrollToTop />
      {!isDashboard && !isMobileViewer && <Navbar />}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.SUPPORT} element={<Support />} />
          <Route path={ROUTES.FEATURES} element={<Features />} />
          <Route path={ROUTES.PRIVACY} element={<Privacy />} />
          <Route path={ROUTES.TERMS} element={<Terms />} />
          <Route path={ROUTES.COOKIES} element={<Cookies />} />
          <Route path={ROUTES.PRICING} element={<Pricing />} />
          <Route path={ROUTES.CONTACT} element={<Contact />} />
          <Route path={ROUTES.PAYMENT} element={<SubscriptionCheckout />} />
          <Route path={ROUTES.SUBSCRIPTION_EXPIRED} element={<SubscriptionExpired />} />
          <Route path={ROUTES.LOGIN} element={<PublicRoute><Login /></PublicRoute>} />
          <Route path={ROUTES.REGISTER} element={<PublicRoute><Register /></PublicRoute>} />
          <Route path={ROUTES.VERIFY} element={<VerifyEmail />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path="/join/:inviteLink" element={<JoinGroup />} />
          <Route path="/mobile-viewer" element={<MobileAnnotationViewer />} />

          {/* DASHBOARD PERSISTENT LAYOUT GROUP */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardWrapper /></ProtectedRoute>}>
            <Route index element={<HomeRedirect />} />

            {/* Admin */}
            <Route path="admin" element={<ProtectedRoute allowedRoles={['APP_ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="admin/users" element={<ProtectedRoute allowedRoles={['APP_ADMIN']}><AdminUsers /></ProtectedRoute>} />
            <Route path="admin/subscriptions" element={<ProtectedRoute allowedRoles={['APP_ADMIN']}><AdminSubscriptions /></ProtectedRoute>} />
            <Route path="admin/settings" element={<ProtectedRoute allowedRoles={['APP_ADMIN']}><AdminSettings /></ProtectedRoute>} />

            {/* PDG */}
            <Route path="pdg" element={<ProtectedRoute allowedRoles={['PDG']}><PDGDashboard /></ProtectedRoute>} />
            <Route path="pdg/messages" element={<ProtectedRoute allowedRoles={['PDG']}><Messages role="PDG" /></ProtectedRoute>} />
            <Route path="pdg/notifications" element={<ProtectedRoute allowedRoles={['PDG']}><Notifications role="PDG" /></ProtectedRoute>} />
            <Route path="pdg/stats" element={<ProtectedRoute allowedRoles={['PDG']}><GlobalStats /></ProtectedRoute>} />
            <Route path="pdg/schools" element={<ProtectedRoute allowedRoles={['PDG']}><Schools /></ProtectedRoute>} />
            <Route path="pdg/finances" element={<ProtectedRoute allowedRoles={['PDG']}><Finances /></ProtectedRoute>} />
            <Route path="pdg/schools/:id" element={<ProtectedRoute allowedRoles={['PDG']}><SchoolDetails /></ProtectedRoute>} />
            <Route path="pdg/select-plan/:institutionId" element={<ProtectedRoute allowedRoles={['PDG']}><SelectPlan /></ProtectedRoute>} />
            <Route path="pdg/students" element={<ProtectedRoute allowedRoles={['PDG']}><PDGStudents /></ProtectedRoute>} />
            <Route path="pdg/teachers" element={<ProtectedRoute allowedRoles={['PDG']}><PDGTeachers /></ProtectedRoute>} />
            <Route path="pdg/cycles" element={<ProtectedRoute allowedRoles={['PDG']}><DirectionCycles /></ProtectedRoute>} />
            <Route path="pdg/enroll" element={<ProtectedRoute allowedRoles={['PDG']}><Enroll /></ProtectedRoute>} />
            <Route path="pdg/settings" element={<ProtectedRoute allowedRoles={['PDG']}><Settings /></ProtectedRoute>} />
            <Route path="pdg/attendance" element={<ProtectedRoute allowedRoles={['PDG']}><Attendance /></ProtectedRoute>} />
            <Route path="pdg/academic-years" element={<ProtectedRoute allowedRoles={['PDG']}><AcademicYears /></ProtectedRoute>} />
            <Route path="pdg/announcements" element={<ProtectedRoute allowedRoles={['PDG']}><Announcements /></ProtectedRoute>} />

            {/* Direction */}
            <Route path="direction" element={<ProtectedRoute allowedRoles={['DIRECTION', 'PROVISORIAT']}><DirectionDashboard /></ProtectedRoute>} />
            <Route path="direction/messages" element={<ProtectedRoute allowedRoles={['DIRECTION', 'PROVISORIAT']}><Messages role="Direction" /></ProtectedRoute>} />
            <Route path="direction/notifications" element={<ProtectedRoute allowedRoles={['DIRECTION', 'PROVISORIAT']}><Notifications role="Direction" /></ProtectedRoute>} />
            <Route path="direction/cycles" element={<ProtectedRoute allowedRoles={['DIRECTION', 'PROVISORIAT']}><DirectionCycles /></ProtectedRoute>} />
            <Route path="direction/fees" element={<ProtectedRoute allowedRoles={['DIRECTION', 'PROVISORIAT']}><TuitionFees /></ProtectedRoute>} />
            <Route path="direction/classes" element={<ProtectedRoute allowedRoles={['DIRECTION', 'PROVISORIAT']}><DirectionClasses /></ProtectedRoute>} />
            <Route path="direction/subjects" element={<ProtectedRoute allowedRoles={['DIRECTION', 'PROVISORIAT']}><DirectionSubjects /></ProtectedRoute>} />
            <Route path="direction/enroll" element={<ProtectedRoute allowedRoles={['DIRECTION', 'PROVISORIAT']}><Enroll /></ProtectedRoute>} />
            <Route path="direction/staff" element={<ProtectedRoute allowedRoles={['DIRECTION', 'PROVISORIAT']}><Staff /></ProtectedRoute>} />
            <Route path="direction/teachers" element={<ProtectedRoute allowedRoles={['DIRECTION', 'PROVISORIAT']}><Teachers /></ProtectedRoute>} />
            <Route path="direction/students" element={<ProtectedRoute allowedRoles={['DIRECTION', 'PROVISORIAT']}><Students /></ProtectedRoute>} />
            <Route path="direction/schedule" element={<ProtectedRoute allowedRoles={['DIRECTION', 'PROVISORIAT']}><Schedule /></ProtectedRoute>} />
            <Route path="direction/rooms" element={<ProtectedRoute allowedRoles={['DIRECTION', 'PROVISORIAT']}><Rooms /></ProtectedRoute>} />
            <Route path="direction/announcements" element={<ProtectedRoute allowedRoles={['DIRECTION', 'PROVISORIAT']}><Announcements /></ProtectedRoute>} />
            <Route path="direction/finances" element={<ProtectedRoute allowedRoles={['DIRECTION', 'PROVISORIAT']}><SchoolFinances /></ProtectedRoute>} />
            <Route path="direction/report-cards" element={<ProtectedRoute allowedRoles={['DIRECTION', 'PROVISORIAT']}><ReportCards role="Direction" /></ProtectedRoute>} />
            <Route path="direction/attendance" element={<ProtectedRoute allowedRoles={['DIRECTION', 'PROVISORIAT']}><Attendance /></ProtectedRoute>} />
            <Route path="direction/academic-years" element={<ProtectedRoute allowedRoles={['DIRECTION', 'PROVISORIAT']}><AcademicYears /></ProtectedRoute>} />

            {/* Secretariat */}
            <Route path="secretariat" element={<ProtectedRoute allowedRoles={['SECRETARIAT']}><SecretariatDashboard /></ProtectedRoute>} />
            <Route path="secretariat/messages" element={<ProtectedRoute allowedRoles={['SECRETARIAT']}><Messages role="Secretariat" /></ProtectedRoute>} />
            <Route path="secretariat/notifications" element={<ProtectedRoute allowedRoles={['SECRETARIAT']}><Notifications role="Secretariat" /></ProtectedRoute>} />
            <Route path="secretariat/cycles" element={<ProtectedRoute allowedRoles={['SECRETARIAT']}><DirectionCycles /></ProtectedRoute>} />
            <Route path="secretariat/fees" element={<ProtectedRoute allowedRoles={['SECRETARIAT']}><TuitionFees /></ProtectedRoute>} />
            <Route path="secretariat/classes" element={<ProtectedRoute allowedRoles={['SECRETARIAT']}><DirectionClasses /></ProtectedRoute>} />
            <Route path="secretariat/subjects" element={<ProtectedRoute allowedRoles={['SECRETARIAT']}><DirectionSubjects /></ProtectedRoute>} />
            <Route path="secretariat/teachers" element={<ProtectedRoute allowedRoles={['SECRETARIAT']}><Teachers /></ProtectedRoute>} />
            <Route path="secretariat/notifications" element={<ProtectedRoute allowedRoles={['SECRETARIAT']}><Notifications role="Secretariat" /></ProtectedRoute>} />
            <Route path="secretariat/enroll" element={<ProtectedRoute allowedRoles={['SECRETARIAT']}><Enroll /></ProtectedRoute>} />
            <Route path="secretariat/students" element={<ProtectedRoute allowedRoles={['SECRETARIAT']}><SecretariatStudents /></ProtectedRoute>} />
            <Route path="secretariat/attendance" element={<ProtectedRoute allowedRoles={['SECRETARIAT']}><Attendance /></ProtectedRoute>} />
            <Route path="secretariat/schedule" element={<ProtectedRoute allowedRoles={['SECRETARIAT']}><Schedule /></ProtectedRoute>} />
            <Route path="secretariat/rooms" element={<ProtectedRoute allowedRoles={['SECRETARIAT']}><Rooms /></ProtectedRoute>} />
            <Route path="secretariat/announcements" element={<ProtectedRoute allowedRoles={['SECRETARIAT']}><Announcements /></ProtectedRoute>} />
            <Route path="secretariat/finances" element={<ProtectedRoute allowedRoles={['SECRETARIAT']}><SchoolFinances /></ProtectedRoute>} />
            <Route path="secretariat/report-cards" element={<ProtectedRoute allowedRoles={['SECRETARIAT']}><ReportCards role="Secretariat" /></ProtectedRoute>} />
            <Route path="secretariat/academic-years" element={<ProtectedRoute allowedRoles={['SECRETARIAT']}><AcademicYears /></ProtectedRoute>} />

            {/* Teacher */}
            <Route path="teacher" element={<ProtectedRoute allowedRoles={['ENSEIGNANT']}><TeacherDashboard /></ProtectedRoute>} />
            <Route path="teacher/messages" element={<ProtectedRoute allowedRoles={['ENSEIGNANT']}><Messages role="Enseignant" /></ProtectedRoute>} />
            <Route path="teacher/notifications" element={<ProtectedRoute allowedRoles={['ENSEIGNANT']}><Notifications role="Enseignant" /></ProtectedRoute>} />
            <Route path="teacher/book" element={<ProtectedRoute allowedRoles={['ENSEIGNANT']}><Book /></ProtectedRoute>} />
            <Route path="teacher/homework" element={<ProtectedRoute allowedRoles={['ENSEIGNANT']}><Homework /></ProtectedRoute>} />
            <Route path="teacher/grades" element={<ProtectedRoute allowedRoles={['ENSEIGNANT']}><Grades /></ProtectedRoute>} />
            <Route path="teacher/classes" element={<ProtectedRoute allowedRoles={['ENSEIGNANT']}><Classes /></ProtectedRoute>} />
            <Route path="teacher/schedule" element={<ProtectedRoute allowedRoles={['ENSEIGNANT']}><TeacherSchedule /></ProtectedRoute>} />
            <Route path="teacher/report-cards" element={<ProtectedRoute allowedRoles={['ENSEIGNANT']}><ReportCards role="Enseignant" /></ProtectedRoute>} />
            <Route path="teacher/attendance" element={<ProtectedRoute allowedRoles={['ENSEIGNANT']}><TeacherAttendance /></ProtectedRoute>} />

            {/* Parents */}
            <Route path="parent" element={<ProtectedRoute allowedRoles={['PARENT', 'PARENTS']}><ParentDashboard /></ProtectedRoute>} />
            <Route path="parent/messages" element={<ProtectedRoute allowedRoles={['PARENT', 'PARENTS']}><Messages role="Parents" /></ProtectedRoute>} />
            <Route path="parent/notifications" element={<ProtectedRoute allowedRoles={['PARENT', 'PARENTS']}><Notifications role="Parents" /></ProtectedRoute>} />
            <Route path="parent/results" element={<ProtectedRoute allowedRoles={['PARENT', 'PARENTS']}><ParentResults /></ProtectedRoute>} />
            <Route path="parent/schedule" element={<ProtectedRoute allowedRoles={['PARENT', 'PARENTS']}><ParentSchedule /></ProtectedRoute>} />
            <Route path="parent/attendance" element={<ProtectedRoute allowedRoles={['PARENT', 'PARENTS']}><ParentAttendance /></ProtectedRoute>} />
            <Route path="parent/payments" element={<ProtectedRoute allowedRoles={['PARENT', 'PARENTS']}><Payments /></ProtectedRoute>} />
            <Route path="parent/enroll" element={<ProtectedRoute allowedRoles={['PARENT', 'PARENTS']}><EnrollChild /></ProtectedRoute>} />
            <Route path="parent/schools" element={<ProtectedRoute allowedRoles={['PARENT', 'PARENTS']}><ExploreSchools /></ProtectedRoute>} />

            {/* Eleve */}
            <Route path="student" element={<ProtectedRoute allowedRoles={['ELEVE']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="student/messages" element={<ProtectedRoute allowedRoles={['ELEVE']}><Messages role="Eleve" /></ProtectedRoute>} />
            <Route path="student/notifications" element={<ProtectedRoute allowedRoles={['ELEVE']}><Notifications role="Eleve" /></ProtectedRoute>} />
            <Route path="student/schedule" element={<ProtectedRoute allowedRoles={['ELEVE']}><StudentSchedule /></ProtectedRoute>} />
            <Route path="student/results" element={<ProtectedRoute allowedRoles={['ELEVE']}><StudentResults /></ProtectedRoute>} />
            <Route path="student/homework" element={<ProtectedRoute allowedRoles={['ELEVE']}><StudentHomework /></ProtectedRoute>} />
            <Route path="student/courses" element={<ProtectedRoute allowedRoles={['ELEVE']}><StudentCourses /></ProtectedRoute>} />
            <Route path="student/payments" element={<ProtectedRoute allowedRoles={['ELEVE']}><Payments /></ProtectedRoute>} />

            {/* Profile Shared */}
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

const HomeRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  const role = user.role.toUpperCase();
  if (role === 'APP_ADMIN') return <Navigate to="/dashboard/admin" />;
  if (role === 'PDG') return <Navigate to="/dashboard/pdg" />;
  if (role === 'DIRECTION' || role === 'PROVISORIAT') return <Navigate to="/dashboard/direction" />;
  if (role === 'SECRETARIAT') return <Navigate to="/dashboard/secretariat" />;
  if (role === 'ENSEIGNANT') return <Navigate to="/dashboard/teacher" />;
  if (role === 'PARENT' || role === 'PARENTS') return <Navigate to="/dashboard/parent" />;
  if (role === 'ELEVE') return <Navigate to="/dashboard/student" />;
  return <Navigate to="/" />;
};

export default App;
