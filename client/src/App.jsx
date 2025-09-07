import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import { ThemeProvider, createTheme, CircularProgress, Box } from '@mui/material';

// Import AuthContext
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

// Import layouts
import MainLayout from './layouts/MainLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

// Import components and pages
import Navbar from './components/Navbar.jsx'; 
import HomePage from './pages/HomePage.jsx';
import CommunityPage from './pages/CommunityPage.jsx'; 
import LeaderboardPage from './pages/LeaderboardPage.jsx'; 
import AdminUserPage from './pages/AdminUserPage.jsx';
import AdminPostsPage from './pages/AdminPostsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Register from './pages/Register.jsx'; 
import ProfilePage from './pages/ProfilePage.jsx';
import MyProgressPage from './pages/MyProgressPage.jsx'; 
import CoachDashboardPage from './pages/CoachDashboardPage.jsx'; 
import CoachMemberProgressPage from './pages/CoachMemberProgressPage.jsx'; 
import ChatCoachPage from './pages/ChatCoachPage.jsx'; 
import SubscriptionPlans from './pages/SubscriptionPlans.jsx';
import AchievementsPage from './pages/AchievementsPage.jsx'; 
import CoachChatPage from './pages/CoachChatPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import UnauthorizedPage from './components/UnauthorizedPage';
import CreatePostPage from './pages/CreatePostPage.jsx';
import AdminPackagePage from './pages/AdminPackagePage.jsx';
import NotificationsPage from './pages/NotificationsPage';
import PaymentPage from './pages/PaymentPage.jsx';
import AdminStatisticsPage from './pages/AdminStatisticsPage.jsx';
import ChatCoachListPage from './pages/ChatCoachListPage.jsx';
import CoachChatListPage from './pages/CoachChatListPage.jsx';
import FeedbackCoachPage from './pages/FeedbackCoachPage.jsx';
import CoachFeedbackPage from './pages/CoachFeedbackPage.jsx';
import AdminFeedbackPage from './pages/AdminFeedbackPage.jsx';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Component bảo vệ route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) { 
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Determine the required role to show appropriate message
    const requiredRole = allowedRoles.includes('memberVip') ? 'memberVip' : allowedRoles[0];
    return <UnauthorizedPage requiredRole={requiredRole} />;
  }

  return children;
};

function SidebarUser({ show, onClose, user }) {
  return (
    <div>
      {/* Overlay */}
      <div
        className={`sidebar-user-overlay${show ? ' show' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: show ? 'rgba(0,0,0,0.3)' : 'transparent',
          zIndex: 99998,
          display: show ? 'block' : 'none',
        }}
        onClick={onClose}
      />
      {/* Sidebar */}
      <nav
        className={`sidebar-user bg-dark text-white d-flex flex-column p-3${show ? ' show' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: show ? 0 : '-260px',
          width: 260,
          height: '100vh',
          zIndex: 99999,
          transition: 'left 0.3s',
          boxShadow: show ? '2px 0 8px rgba(0,0,0,0.2)' : 'none',
          display: 'block',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="sidebar-header text-center">
            <i className="bi bi-person-circle fs-1 mb-2"></i>
            <div className="fw-bold">Xin chào, {user?.username || 'Người dùng'}</div>
          </div>
          <button className="btn btn-sm btn-light ms-2" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item mb-2">
            <Link to="/" className="nav-link text-white">
              <i className="bi bi-house me-2"></i>Trang chủ
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/profile" className="nav-link text-white">
              <i className="bi bi-person me-2"></i>Hồ sơ cá nhân
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/booking" className="nav-link text-white">
              <i className="bi bi-calendar-check me-2"></i>Đặt lịch
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/create-post" className="nav-link text-white">
              <i className="bi bi-plus-square me-2"></i>Tạo bài đăng mới
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/achievements" className="nav-link text-white">
              <i className="bi bi-award me-2"></i>Thành tích
            </Link>
          </li>
          <li className="nav-item mt-4">
            <button className="btn btn-outline-light w-100" onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}>
              <i className="bi bi-box-arrow-right me-2"></i>Đăng xuất
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

function UserLayout() {
  return (
    <div className="d-flex" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <SidebarUser show={false} onClose={() => {}} user={null} />
      <div className="flex-grow-1">
        <Outlet />
      </div>
    </div>
  );
}

// App Routes Component
const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="users" replace />} />
        <Route path="users" element={<AdminUserPage />} />
        <Route path="posts" element={<AdminPostsPage />} />
        <Route path="packages" element={<AdminPackagePage />} />
        <Route path="statistics" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminStatisticsPage />
          </ProtectedRoute>
        } />
        <Route 
          path="/admin/feedback" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminFeedbackPage />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Main routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/blog" element={<CommunityPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/payment" element={<PaymentPage />} />

        {/* Protected routes */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute allowedRoles={['member', 'memberVip', 'coach', 'admin']}>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />

        {/* Member routes */}
        <Route 
          path="/my-progress" 
          element={
            <ProtectedRoute allowedRoles={['member', 'memberVip']}> 
              <MyProgressPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat-coach/:coachId" 
          element={
            <ProtectedRoute allowedRoles={['member', 'memberVip']}>
              <ChatCoachPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat-coach" 
          element={
            <ProtectedRoute allowedRoles={['member', 'memberVip']}>
              <ChatCoachListPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/subscribe" 
          element={
            <ProtectedRoute allowedRoles={['member', 'memberVip']}> 
              <SubscriptionPlans />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/achievements" 
          element={
            <ProtectedRoute allowedRoles={['member', 'memberVip', 'coach', 'admin']}> 
              <AchievementsPage />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/booking"
          element={
            <ProtectedRoute allowedRoles={['member', 'memberVip']}>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-post"
          element={
            <ProtectedRoute allowedRoles={['memberVip']}>
              <CreatePostPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/feedback-coach" 
          element={
            <ProtectedRoute allowedRoles={['memberVip']}>
              <FeedbackCoachPage />
            </ProtectedRoute>
          } 
        />

        {/* Coach routes */}
        <Route 
          path="/coach/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['coach']}>
              <CoachDashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/coach/chat/:memberId" 
          element={
            <ProtectedRoute allowedRoles={['coach']}>
              <CoachChatPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/coach/member/:memberId/progress" 
          element={
            <ProtectedRoute allowedRoles={['coach']}>
              <CoachMemberProgressPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/coach/chat-list" 
          element={
            <ProtectedRoute allowedRoles={['coach']}>
              <CoachChatListPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/coach/member-progress" 
          element={
            <ProtectedRoute allowedRoles={['coach']}>
              <CoachMemberProgressPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/coach/feedback" 
          element={
            <ProtectedRoute allowedRoles={['coach']}>
              <CoachFeedbackPage />
            </ProtectedRoute>
          } 
        />

        {/* Other routes */}
        <Route path="/notifications" element={<NotificationsPage />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      {/* User routes */}
      <Route element={<UserLayout />}>
        <Route path="/my-progress" element={<MyProgressPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/create-post" element={<CreatePostPage />} />
        <Route path="/chat-coach/:coachId" element={<ChatCoachPage />} />
        <Route path="/chat-coach" element={<ChatCoachListPage />} />
        <Route path="/subscribe" element={<SubscriptionPlans />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/feedback-coach" element={<FeedbackCoachPage />} />
      </Route>
    </Routes>
  );
};

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <>
      <Navbar onAvatarClick={() => setShowSidebar(true)} />
      {isAuthenticated && <SidebarUser show={showSidebar} onClose={() => setShowSidebar(false)} user={user} />}
      <AppRoutes />
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router future={{ v7_relativeSplatPath: true }}>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;