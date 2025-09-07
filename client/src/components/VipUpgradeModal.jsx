import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const VipUpgradeModal = ({ show, onHide }) => {
  const navigate = useNavigate();

  const handleUpgradeClick = () => {
    onHide();
    navigate('/subscribe');
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="text-center w-100">
          <i className="fas fa-crown text-warning me-2"></i>
          Nâng cấp thành viên VIP
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="text-center py-4">
        <div className="mb-4">
          <i className="fas fa-lock fa-3x text-muted mb-3"></i>
          <h5 className="text-dark mb-3">Tính năng dành cho thành viên VIP</h5>
          <p className="text-muted mb-4">
            Bạn cần nâng cấp lên <strong>thành viên VIP</strong> để có thể tạo bài đăng và chia sẻ câu chuyện của mình với cộng đồng.
          </p>
        </div>

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
            <div className="mb-2">
              <i className="fas fa-check text-success me-2"></i>
              <small>Truy cập đầy đủ tất cả tính năng cao cấp</small>
            </div>
            <div>
              <i className="fas fa-check text-success me-2"></i>
              <small>Hỗ trợ ưu tiên 24/7</small>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0 justify-content-center">
        <Button 
          variant="outline-secondary" 
          onClick={onHide}
          className="me-2"
        >
          <i className="fas fa-times me-2"></i>
          Để sau
        </Button>
        <Button 
          variant="warning" 
          onClick={handleUpgradeClick}
          className="px-4"
        >
          <i className="fas fa-crown me-2"></i>
          Nâng cấp ngay
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VipUpgradeModal;