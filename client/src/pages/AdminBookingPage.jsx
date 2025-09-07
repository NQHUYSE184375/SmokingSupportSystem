import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import '../style/AdminUserPage.scss'; // Tái sử dụng style của AdminUserPage

// Format tiền theo định dạng Việt Nam
const formatMoney = (value) => {
  if (!value || value === 0) return '0 VNĐ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const AdminBookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Coach assignment states
  const [coaches, setCoaches] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedCoachId, setSelectedCoachId] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Helper function to format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get slot label
  const getSlotLabel = (slot) => {
    const slotMap = {
      '7h-9h': '7:00 - 9:00',
      '10h-12h': '10:00 - 12:00',
      '13h-15h': '13:00 - 15:00',
      '16h-18h': '16:00 - 18:00'
    };
    return slotMap[slot] || slot;
  };

  // Fetch coaches
  const fetchCoaches = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/coaches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoaches(response.data.coaches || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách coaches:", err);
    }
  };

  // Filter bookings based on search term and date
  const filterBookings = useCallback(() => {
    let filtered = bookings;

    // Lọc theo từ khóa tìm kiếm (tên member hoặc coach)
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.MemberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.CoachName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.Note?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Lọc theo ngày
    if (dateFilter === "today") {
      const today = new Date().toDateString();
      filtered = filtered.filter(booking => 
        new Date(booking.SlotDate).toDateString() === today
      );
    } else if (dateFilter === "thisWeek") {
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.SlotDate);
        return bookingDate >= weekStart && bookingDate <= weekEnd;
      });
    } else if (dateFilter === "thisMonth") {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.SlotDate);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      });
    }

    // Sắp xếp theo ngày hẹn gần nhất trước
    filtered.sort((a, b) => new Date(a.SlotDate) - new Date(b.SlotDate));
    setFilteredBookings(filtered);
  }, [bookings, searchTerm, dateFilter]);

  useEffect(() => {
    fetchBookings();
    fetchCoaches();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [filterBookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/booking/admin/paid-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Bookings data:', response.data);
      setBookings(response.data.bookings || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách lịch hẹn:", err);
      setError(err.response?.data?.message || "Không thể tải danh sách lịch hẹn");
    } finally {
      setLoading(false);
    }
  };

  // Handle assign coach
  const handleAssignCoach = (booking) => {
    setSelectedBooking(booking);
    setSelectedCoachId("");
    setShowAssignModal(true);
  };

  // Confirm assign coach
  const confirmAssignCoach = async () => {
    if (!selectedCoachId) {
      alert("Vui lòng chọn huấn luyện viên");
      return;
    }

    try {
      setAssigning(true);
      const token = sessionStorage.getItem('token');
      
      await axios.post('http://localhost:5000/api/booking/admin/assign-coach', {
        bookingId: selectedBooking.Id,
        coachId: selectedCoachId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess("Phân công huấn luyện viên thành công!");
      setShowAssignModal(false);
      fetchBookings(); // Refresh data
      
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      console.error("Lỗi khi phân công coach:", err);
      setError(err.response?.data?.message || "Không thể phân công huấn luyện viên");
      setTimeout(() => setError(""), 5000);
    } finally {
      setAssigning(false);
    }
  };

  const getStatistics = () => {
    const totalBookings = bookings.length;
    const totalAmount = bookings.reduce((sum, booking) => sum + (booking.Amount || 0), 0);
    const todayBookings = bookings.filter(booking => 
      new Date(booking.SlotDate).toDateString() === new Date().toDateString()
    ).length;
    const thisWeekBookings = bookings.filter(booking => {
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      const bookingDate = new Date(booking.SlotDate);
      return bookingDate >= weekStart && bookingDate <= weekEnd;
    }).length;

    return { totalBookings, totalAmount, todayBookings, thisWeekBookings };
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-user-page">
      <div className="admin-container">
        <h2 className="page-title">
          <i className="fas fa-calendar-check me-3"></i>
          Quản lý Lịch hẹn đã thanh toán
        </h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" role="alert">
            {success}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card stat-card bg-primary text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title mb-0">Tổng lịch hẹn</h5>
                    <h3 className="mb-0">{stats.totalBookings}</h3>
                  </div>
                  <i className="fas fa-calendar-alt fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card stat-card bg-success text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title mb-0">Tổng doanh thu</h5>
                    <h3 className="mb-0">{formatMoney(stats.totalAmount)}</h3>
                  </div>
                  <i className="fas fa-money-bill-wave fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card stat-card bg-info text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title mb-0">Hôm nay</h5>
                    <h3 className="mb-0">{stats.todayBookings}</h3>
                  </div>
                  <i className="fas fa-calendar-day fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card stat-card bg-warning text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title mb-0">Tuần này</h5>
                    <h3 className="mb-0">{stats.thisWeekBookings}</h3>
                  </div>
                  <i className="fas fa-calendar-week fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm theo tên thành viên, coach hoặc ghi chú..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="today">Hôm nay</option>
                  <option value="thisWeek">Tuần này</option>
                  <option value="thisMonth">Tháng này</option>
                </select>
              </div>
              <div className="col-md-3">
                <button 
                  className="btn btn-outline-primary w-100"
                  onClick={fetchBookings}
                >
                  <i className="fas fa-refresh me-2"></i>
                  Tải lại
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Danh sách lịch hẹn đã thanh toán ({filteredBookings.length})</h5>
          </div>
          <div className="card-body p-0">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-4">
                <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                <p className="text-muted">Không có lịch hẹn nào được tìm thấy</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Thành viên</th>
                      <th>Coach</th>
                      <th>Ngày hẹn</th>
                      <th>Khung giờ</th>
                      <th>Trạng thái</th>
                      <th>Thanh toán</th>
                      <th>Số tiền</th>
                      <th>Ghi chú</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking.Id}>
                        <td>
                          <span className="badge bg-secondary">{booking.Id}</span>
                        </td>
                        <td>
                          <div>
                            <strong>{booking.MemberName}</strong>
                            {booking.MemberEmail && (
                              <div className="text-muted small">{booking.MemberEmail}</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{booking.CoachName}</strong>
                            {booking.CoachEmail && (
                              <div className="text-muted small">{booking.CoachEmail}</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{formatDate(booking.SlotDate)}</strong>
                            <div className="text-muted small">
                              Tạo: {formatDate(booking.CreatedAt)}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-info">
                            {getSlotLabel(booking.Slot)}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-success">
                            {booking.Status}
                          </span>
                        </td>
                        <td>
                          {booking.PaymentDate && (
                            <div>
                              <div className="text-success">
                                <i className="fas fa-check-circle me-1"></i>
                                {formatDate(booking.PaymentDate)}
                              </div>
                              <div className="text-muted small">
                                {formatTime(booking.PaymentDate)}
                              </div>
                            </div>
                          )}
                        </td>
                        <td>
                          <strong className="text-success">
                            {formatMoney(booking.Amount || 0)}
                          </strong>
                        </td>
                        <td>
                          {booking.Note ? (
                            <span className="text-muted">{booking.Note}</span>
                          ) : (
                            <span className="text-muted fst-italic">Không có ghi chú</span>
                          )}
                        </td>
                        <td>
                          {!booking.CoachName ? (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleAssignCoach(booking)}
                            >
                              <i className="fas fa-user-plus me-1"></i>
                              Phân công Coach
                            </button>
                          ) : (
                            <span className="text-success">
                              <i className="fas fa-check-circle me-1"></i>
                              Đã phân công
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Assign Coach Modal */}
        {showAssignModal && (
          <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="fas fa-user-plus me-2"></i>
                    Phân công Huấn luyện viên
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowAssignModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {selectedBooking && (
                    <div className="mb-3">
                      <h6>Thông tin lịch hẹn:</h6>
                      <div className="card bg-light">
                        <div className="card-body">
                          <p className="mb-1"><strong>Thành viên:</strong> {selectedBooking.MemberName}</p>
                          <p className="mb-1"><strong>Ngày:</strong> {formatDate(selectedBooking.SlotDate)}</p>
                          <p className="mb-0"><strong>Khung giờ:</strong> {getSlotLabel(selectedBooking.Slot)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <label htmlFor="coachSelect" className="form-label">
                      <strong>Chọn Huấn luyện viên:</strong>
                    </label>
                    <select
                      id="coachSelect"
                      className="form-select"
                      value={selectedCoachId}
                      onChange={(e) => setSelectedCoachId(e.target.value)}
                    >
                      <option value="">-- Chọn huấn luyện viên --</option>
                      {coaches.map((coach) => (
                        <option key={coach.Id} value={coach.Id}>
                          {coach.Username} - {coach.Email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowAssignModal(false)}
                  >
                    Hủy
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={confirmAssignCoach}
                    disabled={assigning || !selectedCoachId}
                  >
                    {assigning ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Đang phân công...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check me-1"></i>
                        Xác nhận phân công
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookingPage; 