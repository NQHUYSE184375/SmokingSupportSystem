import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = ({ requiredRole = 'memberVip' }) => {
  const navigate = useNavigate();

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'memberVip':
        return 'thành viên VIP';
      case 'admin':
        return 'quản trị viên';
      case 'coach':
        return 'huấn luyện viên';
      default:
        return 'thành viên';
    }
  };

  const handleUpgrade = () => {
    if (requiredRole === 'memberVip') {
      navigate('/subscribe');
    } else {
      navigate('/');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <Card className="text-center shadow-sm" style={{ maxWidth: '500px', width: '100%' }}>
        <Card.Body className="p-5">
          <div className="mb-4">
            <i className="fas fa-lock fa-4x text-muted mb-3"></i>
            <h3 className="text-dark mb-3">Truy cập bị hạn chế</h3>
            <p className="text-muted mb-4">
              Tính năng này chỉ dành cho <strong>{getRoleDisplay(requiredRole)}</strong>. 
              {requiredRole === 'memberVip' && (
                <span> Vui lòng nâng cấp tài khoản để truy cập đầy đủ các tính năng.</span>
              )}
            </p>
          </div>

          {requiredRole === 'memberVip' && (
            <div className="bg-light rounded p-3 mb-4">
              <h6 className="text-dark mb-3">
                <i className="fas fa-star text-warning me-2"></i>
                Quyền lợi thành viên VIP
              </h6>
              <div className="text-start">
                <div className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  <small>Tạo và chia sẻ bài viết cá nhân</small>
                </div>
                <div className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  <small>Đặt lịch tư vấn 1-1 với chuyên gia</small>
                </div>
                <div className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  <small>Đánh giá và phản hồi huấn luyện viên</small>
                </div>
                <div>
                  <i className="fas fa-check text-success me-2"></i>
                  <small>Hỗ trợ ưu tiên 24/7</small>
                </div>
              </div>
            </div>
          )}

          <div className="d-flex gap-2 justify-content-center">
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/')}
            >
              <i className="fas fa-home me-2"></i>
              Về trang chủ
            </Button>
            
            {requiredRole === 'memberVip' && (
              <Button 
                variant="warning" 
                onClick={handleUpgrade}
              >
                <i className="fas fa-crown me-2"></i>
                Nâng cấp VIP
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UnauthorizedPage;