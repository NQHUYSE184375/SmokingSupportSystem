import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const SidebarUser = ({ show, onClose, user, menuItems }) => {
  const { user: authUser } = useAuth();
  // Nếu không truyền menuItems, xác định theo role member/coach
  let items = menuItems;
  if (!items) {
    if (user?.role === 'member' || user?.role === 'memberVip') {
      items = [
        { href: '/profile', icon: 'bi-person', label: 'Hồ sơ cá nhân' },
        { href: '/chat-coach', icon: 'bi-chat-dots', label: 'Chat với chuyên gia' },
        { href: '/my-progress', icon: 'bi-graph-up', label: 'Theo dõi quá trình' },
        { href: '/booking', icon: 'bi-calendar-check', label: 'Đặt lịch' },
        { href: '/create-post', icon: 'bi-plus-square', label: 'Tạo bài đăng mới' },
        { href: '/achievements', icon: 'bi-award', label: 'Thành tích' },
      ];
    } else if (user?.role === 'coach') {
      items = [
        { href: '/profile', icon: 'bi-person', label: 'Hồ sơ cá nhân' },
        { href: '/coach/chat-list', icon: 'bi-chat-dots', label: 'Chat với thành viên' },
        { href: '/coach/member-progress', icon: 'bi-graph-up', label: 'Xem tiến trình thành viên' },
        { href: '/coach/dashboard', icon: 'bi-calendar-check', label: 'Lịch tư vấn' },
        { href: '/coach/feedback', icon: 'bi-star', label: 'Đánh giá của khách hàng' },
      ];
    }
  }
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
            <div className="fw-bold">Xin chào, {user?.username || 'Người dùng'}</div>
          </div>
          <button className="btn btn-sm btn-light ms-2" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <ul className="nav nav-pills flex-column mb-auto">
          {items && items.map(item => (
            <li className="nav-item mb-2" key={item.href}>
              <Link to={item.href} className="nav-link text-white text-center" onClick={onClose} style={{textAlign: 'center'}}>
                <i className={`bi ${item.icon} me-2`}></i>{item.label}
              </Link>
            </li>
          ))}
          {authUser && authUser.role === 'memberVip' && (
            <li className="nav-item mb-2">
              <Link to="/feedback-coach" className="nav-link text-white text-center" style={{textAlign: 'center'}}>
                <i className="bi bi-star me-2"></i>Đánh giá HLV
              </Link>
            </li>
          )}
          <li className="nav-item mt-4">
            <button className="btn btn-outline-light w-100 text-center" onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }} style={{textAlign: 'center'}}>
              <i className="bi bi-box-arrow-right me-2"></i>Đăng xuất
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default SidebarUser; 