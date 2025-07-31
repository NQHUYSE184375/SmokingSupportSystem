import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../style/Sidebar.scss';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = user && user.role === 'admin';

  if (!isAdmin) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/admin/users',
      icon: 'bi-people',
      label: 'Quản lý tài khoản'
    },
    {
      path: '/admin/packages',
      icon: 'bi-box',
      label: 'Quản lý gói thành viên'
    },
    {
      path: '/admin/posts',
      icon: 'bi-file-text',
      label: 'Duyệt bài viết'
    },
    {
      path: '/admin/statistics',
      icon: 'bi-bar-chart-line',
      label: 'Thống kê hệ thống'
    },
    {
      path: '/admin/feedback',
      icon: 'bi-star',
      label: 'Đánh giá của khách hàng'
    }
  ];

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Close sidebar when clicking outside
  const handleOverlayClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Toggle Button */}
      <button 
        className="sidebar-toggle"
        onClick={toggleSidebar}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 16px',
          color: 'white',
          fontSize: '1.2rem',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.05)';
          e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        }}
      >
        <i className="bi bi-list"></i>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={handleOverlayClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(2px)',
            zIndex: 9998,
            animation: 'fadeIn 0.3s ease-in-out'
          }}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`sidebar ${isOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: isOpen ? '0' : '-320px',
          width: '320px',
          height: '100vh',
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          color: 'white',
          zIndex: 9999,
          boxShadow: '4px 0 20px rgba(0,0,0,0.4)',
          overflowY: 'auto',
          transition: 'left 0.3s ease-out',
          borderRight: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {/* Header */}
        <div className="sidebar-header" style={{
          padding: '2rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.05)'
        }}>
          <i className="bi bi-shield-lock" style={{ 
            fontSize: '2.5rem', 
            marginBottom: '1rem', 
            display: 'block', 
            color: '#3498db' 
          }}></i>
          <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 600 }}>Admin Dashboard</h3>
          <small style={{ color: '#bdc3c7', fontSize: '0.9rem' }}>Quản lý hệ thống</small>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" style={{ padding: '1.5rem 0' }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                color: 'white',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                borderLeft: location.pathname === item.path ? '4px solid #3498db' : '4px solid transparent',
                background: location.pathname === item.path ? 'rgba(52, 152, 219, 0.2)' : 'transparent'
              }}
              onClick={() => setIsOpen(false)}
              onMouseEnter={(e) => {
                if (location.pathname !== item.path) {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.transform = 'translateX(5px)';
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== item.path) {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'translateX(0)';
                }
              }}
            >
              <i className={`bi ${item.icon}`} style={{ 
                fontSize: '1.2rem', 
                marginRight: '1rem',
                width: '20px',
                textAlign: 'center'
              }}></i>
              <span style={{ fontSize: '1rem' }}>{item.label}</span>
            </Link>
          ))}
          
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1rem 0' }}></div>
          
          <button 
            onClick={handleLogout} 
            className="sidebar-item logout-button" 
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '1rem 1.5rem',
              background: 'transparent',
              border: 'none',
              color: '#e74c3c',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '1rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(231, 76, 60, 0.2)';
              e.target.style.transform = 'translateX(5px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.transform = 'translateX(0)';
            }}
          >
            <i className="bi bi-box-arrow-right" style={{ 
              fontSize: '1.2rem', 
              marginRight: '1rem',
              width: '20px',
              textAlign: 'center'
            }}></i>
            <span>Đăng xuất</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer" style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center',
          position: 'absolute',
          bottom: 0,
          width: '100%',
          background: 'rgba(255,255,255,0.05)'
        }}>
          <span style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Smoking Support System</span>
          <small style={{ color: '#bdc3c7', fontSize: '0.8rem' }}>Admin Panel v1.0</small>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 