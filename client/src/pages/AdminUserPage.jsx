// Giao diện trang quản lý người dùng cho admin
import React, { useState, useEffect, useCallback, useRef } from "react";
import { getUsers, getUserDetail, updateUser, deleteUser } from "../services/adminService";
import Chart from 'chart.js/auto';
import '../style/AdminUserPage.scss';
import axios from 'axios';
import { Link } from 'react-router-dom';

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

const AdminUserPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [formData, setFormData] = useState({
    id: "",
    username: "",
    email: "",
    phoneNumber: "",
    address: "",
    role: "",
    isMember: false
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  // Không cần useState cho pendingCoaches, chỉ lọc trực tiếp từ users

  const getUserRole = (user) => {
    if (user.role) {
      return user.role.toLowerCase();
    }
    if (user.isAdmin === 1) return "admin";
    return "guest";
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin": return "#f44336";
      case "coach": return "#2196f3";
      case "membervip": return "#43a047"; // Xanh lá cho Thành viên Vip
      case "member": return "#ff9800";
      case "guest": return "#9e9e9e";
      default: return "#9e9e9e";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin": return "Quản trị viên";
      case "coach": return "Huấn luyện viên";
      case "membervip": return "Thành viên Vip";
      case "member": return "Thành viên";
      case "guest": return "Khách hàng";
      default: return "Khách hàng";
    }
  };

  const filterUsers = useCallback(() => {
    let filtered = users;

    // Bỏ user admin khỏi danh sách hiển thị cho admin
    filtered = filtered.filter(user => user.role !== 'admin');

    // Ẩn coach chưa duyệt
    filtered = filtered.filter(user => !(user.role === 'coach' && user.isCoachApproved !== 1 && user.isCoachApproved !== true));

    // Lọc theo từ khóa tìm kiếm (username hoặc email)
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Lọc theo vai trò
    if (roleFilter === "member") {
      filtered = filtered.filter(user => {
        const role = getUserRole(user);
        return role === "member" || role === "membervip";
      });
    } else if (roleFilter === "guest") {
      filtered = filtered.filter(user => {
        const role = getUserRole(user);
        return role === "guest";
      });
    } else if (roleFilter === "coach") {
      filtered = filtered.filter(user => getUserRole(user) === "coach");
    } else if (roleFilter !== "all") {
      filtered = filtered.filter(user => getUserRole(user) === roleFilter);
    }

    // Sắp xếp danh sách đã lọc theo ID tăng dần
    const sortedFiltered = filtered.sort((a, b) => a.id - b.id);
    setFilteredUsers(sortedFiltered);
  }, [users, searchTerm, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      console.log('Đang tải người dùng...');
      const data = await getUsers();
      console.log('Dữ liệu người dùng nhận được:', data);
      
      // Kiểm tra định dạng dữ liệu nhận được
      if (!data || !Array.isArray(data)) {
        console.error('Định dạng dữ liệu không hợp lệ:', data);
        setSnackbar({
          open: true,
          message: "Dữ liệu người dùng không hợp lệ",
          severity: "error",
        });
        return;
      }

      // Chuyển đổi các thuộc tính từ PascalCase sang camelCase để dễ xử lý trong React
      const formattedData = data.map(user => ({
        id: user.Id,
        username: user.Username,
        email: user.Email,
        phoneNumber: user.PhoneNumber,
        address: user.Address,
        role: user.Role,
        isMember: user.IsMember,
        createdAt: user.CreatedAt,
        isCoachApproved: user.IsCoachApproved // Thêm dòng này để lọc coach chờ duyệt
      }));

      // Sắp xếp danh sách đã định dạng theo ID tăng dần
      const sortedData = formattedData.sort((a, b) => a.id - b.id);
      console.log('Dữ liệu người dùng đã sắp xếp:', sortedData);
      setUsers(sortedData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
      console.error("Chi tiết lỗi:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = "Lỗi khi tải danh sách người dùng";
      
      // Xử lý các loại lỗi cụ thể
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
        } else if (error.response.status === 403) {
          errorMessage = "Bạn không có quyền truy cập trang này.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const getStatistics = () => {
    // Lọc bỏ admin khỏi thống kê
    const filteredUsers = users.filter(user => user.role !== 'admin');
    const coachCount = filteredUsers.filter(user => getUserRole(user) === "coach").length;
    const memberVipCount = filteredUsers.filter(user => getUserRole(user) === "membervip").length;
    const memberOnlyCount = filteredUsers.filter(user => getUserRole(user) === "member").length;
    const totalUsers = filteredUsers.length;
    return { coachCount, memberOnlyCount, memberVipCount, totalUsers };
  };

  const handleEdit = (user) => {
    setFormData({
      id: user.id,
      username: user.username || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
      role: user.role || "guest", // Đặt vai trò mặc định là 'guest' nếu không có
      isMember: user.isMember || false // Đặt mặc định là false nếu không có
    });
    setOpen(true); // Mở dialog chỉnh sửa
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      id: "",
      username: "",
      email: "",
      phoneNumber: "",
      address: "",
      role: "",
      isMember: false
    });
  };

  const handleSave = async () => {
    try {
      const updatedUser = await updateUser(formData.id, formData);
      // Cập nhật người dùng trong danh sách hiển thị
      setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
      setSnackbar({
        open: true,
        message: "Cập nhật người dùng thành công!",
        severity: "success",
      });
      handleClose(); // Đóng dialog sau khi lưu
    } catch (error) {
      console.error("Lỗi khi cập nhật người dùng:", error);
      let errorMessage = "Cập nhật người dùng thất bại.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) {
      try {
        await deleteUser(userId);
        await fetchUsers(); // Cập nhật lại danh sách từ server
        setSnackbar({
          open: true,
          message: "Xóa người dùng thành công!",
          severity: "success",
        });
      } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        let errorMessage = "Xóa người dùng thất bại.";
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: "error",
        });
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleViewUserDetail = async (userId) => {
    try {
      const data = await getUserDetail(userId);
      setSelectedUserDetail(data);
      setDetailOpen(true);
      
      // Sau khi modal mở và dữ liệu được load, tạo biểu đồ
      setTimeout(() => {
        if (data.smokingProfile?.dailyLogs?.length > 0) {
          createSmokingChart(data.smokingProfile.dailyLogs);
        }
      }, 100);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết người dùng:", error);
      let errorMessage = "Không thể tải chi tiết người dùng.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleCloseDetail = () => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    setDetailOpen(false);
    setSelectedUserDetail(null);
  };

  const createSmokingChart = (dailyLogs) => {
    const ctx = document.getElementById('smokingChart');
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const sortedLogs = [...dailyLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
    const dates = sortedLogs.map(log => new Date(log.date).toLocaleDateString('vi-VN'));
    const cigarettes = sortedLogs.map(log => log.cigarettes);

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Số điếu thuốc',
          data: cigarettes,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Biểu đồ hút thuốc 7 ngày gần đây'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Số điếu'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Ngày'
            }
          }
        }
      }
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const { coachCount, memberOnlyCount, memberVipCount, totalUsers } = getStatistics();

  // Thay vì fetchPendingCoaches, lọc coach chờ duyệt từ users
  const pendingCoaches = users.filter(user => user.role === 'coach' && (!user.isCoachApproved || user.isCoachApproved === 0 || user.isCoachApproved === false));

  const handleApproveCoach = async (coachId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/admin/approve-coach/${coachId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Duyệt huấn luyện viên thành công!', severity: 'success' });
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: 'Duyệt thất bại!', severity: 'error' });
    }
  };

  const handleRejectCoach = async (coachId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy tài khoản huấn luyện viên này?')) return;
    try {
      // setPendingCoaches(prev => prev.filter(c => c.Id !== coachId)); // Xóa mọi setPendingCoaches
      setSnackbar({ open: true, message: 'Đã hủy tài khoản huấn luyện viên!', severity: 'success' });
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: 'Hủy thất bại!', severity: 'error' });
    }
  };

  return (
    <div className="container-fluid py-4" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #28a745 0%, #20c997 50%, #17a2b8 100%)' }}>
      <div className="container-xl">
        <div className="bg-white rounded-3 shadow p-4 mb-4 position-relative overflow-hidden">
          <div className="position-absolute top-0 start-0 w-100" style={{ height: '4px', background: 'linear-gradient(90deg, #28a745, #20c997, #17a2b8)' }} />
          <h2 className="fw-bold text-center mb-4 text-success"><i className="bi bi-speedometer2 me-2"></i>Quản Lý Người Dùng</h2>

          {/* Thẻ thống kê */}
          <div className="row mb-4 g-3">
            <div className="col-6 col-md-3">
              <div className="card text-white bg-success h-100">
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div>
                    <div className="small fw-bold">Tổng số Người dùng</div>
                    <div className="h3 fw-bold">{totalUsers}</div>
                  </div>
                  <i className="bi bi-people-fill fs-2 opacity-75"></i>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card text-white bg-info h-100">
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div>
                    <div className="small fw-bold">Thành viên Vip</div>
                    <div className="h3 fw-bold">{memberVipCount}</div>
                  </div>
                  <i className="bi bi-gem fs-2 opacity-75"></i>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card text-white bg-primary h-100">
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div>
                    <div className="small fw-bold">Huấn luyện viên</div>
                    <div className="h3 fw-bold">{coachCount}</div>
                  </div>
                  <i className="bi bi-person-badge-fill fs-2 opacity-75"></i>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card text-white bg-secondary h-100">
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div>
                    <div className="small fw-bold">Thành viên</div>
                    <div className="h3 fw-bold">{memberOnlyCount}</div>
                  </div>
                  <i className="bi bi-person-fill fs-2 opacity-75"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Duyệt tài khoản huấn luyện viên */}
          <div className="card mb-4">
            <div className="card-header bg-info text-white fw-bold">Huấn luyện viên chờ duyệt</div>
            <div className="card-body">
              {pendingCoaches.length === 0 ? (
                <div className="text-muted">Không có huấn luyện viên nào chờ duyệt.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Tên đăng nhập</th>
                        <th>Email</th>
                        <th>Ngày đăng ký</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingCoaches.map(coach => (
                        <tr key={coach.id}>
                          <td>{coach.id}</td>
                          <td>{coach.username}</td>
                          <td>{coach.email}</td>
                          <td>{coach.createdAt ? new Date(coach.createdAt).toLocaleDateString('vi-VN') : ''}</td>
                          <td><span className="badge bg-warning text-dark">Chờ duyệt</span></td>
                          <td>
                            <button className="btn btn-success btn-sm me-2" onClick={() => handleApproveCoach(coach.id)}>
                              Duyệt
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleRejectCoach(coach.id)}>
                              Hủy
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Thanh tìm kiếm và bộ lọc vai trò */}
          <form className="row g-2 align-items-center mb-3">
            <div className="col-md-6">
              <input type="text" className="form-control" placeholder="Tìm kiếm (Tên đăng nhập/Email)" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="col-md-4">
              <select className="form-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                <option value="all">Tất cả</option>
                <option value="member">Thành viên</option>
                <option value="coach">Huấn luyện viên</option>
                <option value="guest">Khách hàng</option>
              </select>
            </div>
          </form>

            {/* Bảng danh sách người dùng */}
          <div className="table-responsive mb-4">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-success">
                <tr>
                  <th>ID</th>
                  <th>Tên đăng nhập</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th className="text-end">Hành động</th>
                </tr>
              </thead>
              <tbody>
                  {filteredUsers.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-3">Không tìm thấy người dùng nào.</td></tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.phoneNumber || 'N/A'}</td>
                      <td><span className={`badge ${getUserRole(user) === 'coach' ? 'bg-primary' : getUserRole(user) === 'membervip' ? 'bg-success' : getUserRole(user) === 'member' ? 'bg-warning text-dark' : 'bg-secondary'}`}>{getRoleLabel(getUserRole(user))}</span></td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEdit(user)}><i className="bi bi-pencil-square"></i> Sửa</button>
                        <button className="btn btn-sm btn-outline-danger me-1" onClick={() => handleDelete(user.id)}><i className="bi bi-trash"></i> Xóa</button>
                        <button className="btn btn-sm btn-outline-info" onClick={() => handleViewUserDetail(user.id)}><i className="bi bi-info-circle"></i> Chi tiết</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Modal chỉnh sửa người dùng */}
          <div className={`modal fade${open ? ' show d-block' : ''}`} tabIndex="-1" style={{ background: open ? 'rgba(0,0,0,0.3)' : 'none' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Chỉnh sửa Người dùng - {formData.username}</h5>
                  <button type="button" className="btn-close" onClick={handleClose}></button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Tên đăng nhập</label>
                        <input type="text" className="form-control" name="username" value={formData.username} onChange={handleInputChange} />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Số điện thoại</label>
                        <input type="text" className="form-control" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Vai trò</label>
                        <select className="form-select" name="role" value={formData.role} onChange={handleInputChange}>
                          <option value="guest">Khách hàng</option>
                          <option value="member">Thành viên</option>
                          <option value="membervip">Thành viên Vip</option>
                          <option value="coach">Huấn luyện viên</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Địa chỉ</label>
                      <textarea className="form-control" name="address" rows="2" value={formData.address} onChange={handleInputChange}></textarea>
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleClose}>Hủy</button>
                  <button type="button" className="btn btn-primary" onClick={handleSave}>Lưu thay đổi</button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal chi tiết người dùng */}
          <div className={`modal fade${detailOpen ? ' show d-block' : ''}`} tabIndex="-1" style={{ background: detailOpen ? 'rgba(0,0,0,0.3)' : 'none' }}>
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header border-bottom">
                  <h5 className="modal-title">Chi tiết tài khoản</h5>
                  <button type="button" className="btn-close" onClick={handleCloseDetail}></button>
                </div>
                <div className="modal-body">
          {selectedUserDetail ? (
                    <div>
                      {/* Thông tin cá nhân */}
                      <div className="card mb-3">
                        <div className="card-header bg-primary text-white"><strong>📋 Thông tin cá nhân</strong></div>
                        <div className="card-body row g-2">
                          <div className="col-md-4"><strong>ID:</strong> {selectedUserDetail.id}</div>
                          <div className="col-md-4"><strong>Tên đăng nhập:</strong> {selectedUserDetail.username}</div>
                          <div className="col-md-4"><strong>Email:</strong> {selectedUserDetail.email}</div>
                          <div className="col-md-4"><strong>Số điện thoại:</strong> {selectedUserDetail.phoneNumber || 'Chưa cập nhật'}</div>
                          <div className="col-md-4"><strong>Địa chỉ:</strong> {selectedUserDetail.address || 'Chưa cập nhật'}</div>
                          <div className="col-md-4"><strong>Ngày tạo:</strong> {selectedUserDetail.createdAt ? new Date(selectedUserDetail.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</div>
                        </div>
                      </div>
                    
                      {/* Thông tin theo role Coach */}
                      {selectedUserDetail.role === 'coach' && (
                        <div className="mb-3">
                          <div className="fw-bold mb-2">Thành viên được phụ trách ({selectedUserDetail.assignedMembers?.length || 0} người):</div>
                          <div className="member-list-wrapper">
                            {selectedUserDetail.assignedMembers && selectedUserDetail.assignedMembers.length > 0 ? (
                              selectedUserDetail.assignedMembers.map(member => (
                                <div className="col-12 mb-4" key={member.id}>
                                  <div className="card member-detail-card shadow-sm p-0">
                                    <div className="row g-0 flex-wrap">
                                      {/* Thông tin cá nhân */}
                                      <div className="col-md-3 border-end bg-light p-3 d-flex flex-column justify-content-center">
                                        <div className="section-label text-primary mb-3"><i className="bi bi-person-fill me-2"></i>Thông tin cá nhân</div>
                                        <div className="info-row"><span className="info-label">Tên:</span> <span className="info-value">{member.username}</span></div>
                                        <div className="info-row"><span className="info-label">Email:</span> <span className="info-value">{member.email}</span></div>
                                        <div className="info-row"><span className="info-label">SĐT:</span> <span className="info-value">{member.phoneNumber}</span></div>
                                      </div>
                                      {/* Thông tin hút thuốc */}
                                      <div className="col-md-5 border-end bg-success-subtle p-3 d-flex flex-column justify-content-center">
                                        <div className="section-label text-success mb-3"><i className="bi bi-emoji-smile me-2"></i>Thông tin hút thuốc</div>
                                        <div className="smoking-info-table">
                                          <div className="row info-row align-items-center mb-2">
                                            <div className="col-6 info-label">Điếu/ngày:</div>
                                            <div className="col-6 info-value">{member.cigarettesPerDay}</div>
                                          </div>
                                          <div className="row info-row align-items-center mb-2">
                                            <div className="col-6 info-label">Giá/gói:</div>
                                            <div className="col-6 info-value">{member.costPerPack ? formatMoney(member.costPerPack) : 'N/A'}</div>
                                          </div>
                                          <div className="row info-row align-items-center mb-2">
                                            <div className="col-6 info-label">Tần suất hút:</div>
                                            <div className="col-6 info-value">{member.smokingFrequency || 'Chưa cập nhật'}</div>
                                          </div>
                                          <div className="row info-row align-items-center mb-2">
                                            <div className="col-6 info-label">Loại thuốc:</div>
                                            <div className="col-6 info-value">{member.cigaretteType || 'Chưa cập nhật'}</div>
                                          </div>
                                          <div className="row info-row align-items-center mb-2">
                                            <div className="col-6 info-label">Tình trạng sức khỏe:</div>
                                            <div className="col-6 info-value">{member.healthStatus || 'Chưa cập nhật'}</div>
                                          </div>
                                          <div className="row info-row align-items-center">
                                            <div className="col-6 info-label">Lý do cai:</div>
                                            <div className="col-6 info-value">{member.quitReason || 'Chưa cập nhật'}</div>
                                          </div>
                                        </div>
                                      </div>
                                      {/* Thông tin booking */}
                                      <div className="col-md-4 bg-warning-subtle p-3 d-flex flex-column justify-content-center">
                                        <div className="section-label text-warning mb-3"><i className="bi bi-calendar-check me-2"></i>Thông tin đặt lịch</div>
                                        <div className="row g-1">
                                          <div className="col-12 info-row mb-2">
                                            <span className="info-label">Trạng thái đặt lịch:</span>
                                            <span className={`badge fw-bold px-3 py-2 rounded-pill ${member.bookingStatus === 'đã xác nhận' ? 'bg-success' : member.bookingStatus === 'đã hủy' ? 'bg-danger' : 'bg-warning text-dark'}`}>{member.bookingStatus || 'Chưa có'}</span>
                                          </div>
                                          <div className="col-6 info-row"><span className="info-label">Khung giờ:</span> <span className="info-value">{member.slot || 'Chưa có'}</span></div>
                                          <div className="col-6 info-row"><span className="info-label">Ngày hẹn:</span> <span className="info-value">{member.slotDate ? new Date(member.slotDate).toLocaleDateString('vi-VN') : 'Chưa có'}</span></div>
                                          <div className="col-12 info-row"><span className="info-label">Ghi chú booking:</span> <span className="info-value">{member.bookingNote || 'Không có'}</span></div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-secondary">Chưa có thành viên được phân công</div>
                            )}
                          </div>
                        </div>
                      )}
              {/* Thông tin hút thuốc - Chỉ hiển thị nếu không phải là Coach */}
              {selectedUserDetail.role !== 'coach' && selectedUserDetail.smokingProfile && (
                <div className="card mb-3">
                          <div className="card-header bg-info text-white">
                    <strong>🚬 Thông tin hút thuốc</strong>
                  </div>
                  <div className="card-body">
                            <div className="row g-3">
                              <div className="col-md-4">
                                <strong>Số điếu/ngày:</strong> {selectedUserDetail.smokingProfile.cigarettesPerDay}
                      </div>
                              <div className="col-md-4">
                                <strong>Chi phí/gói:</strong> {formatMoney(selectedUserDetail.smokingProfile.costPerPack)}
                      </div>
                              <div className="col-md-4">
                                <strong>Tần suất:</strong> {selectedUserDetail.smokingProfile.smokingFrequency || 'Chưa cập nhật'}
                    </div>
                              <div className="col-md-4">
                                <strong>Tình trạng sức khỏe:</strong> {selectedUserDetail.smokingProfile.healthStatus || 'Chưa cập nhật'}
                      </div>
                              <div className="col-md-4">
                        <strong>Loại thuốc:</strong> {selectedUserDetail.smokingProfile.cigaretteType || 'Chưa cập nhật'}
                      </div>
                              <div className="col-md-4">
                                <strong>Lý do cai thuốc:</strong> {selectedUserDetail.smokingProfile.quitReason || 'Chưa cập nhật'}
                    </div>
                      </div>

                            {/* Biểu đồ nhật ký hút thuốc */}
                            {selectedUserDetail.smokingProfile.dailyLogs && selectedUserDetail.smokingProfile.dailyLogs.length > 0 && (
                              <div className="mt-4">
                                <h6 className="mb-3">📊 Nhật ký hút thuốc 7 ngày gần đây</h6>
                                <div className="chart-container" style={{ position: 'relative', height: '200px' }}>
                                  <canvas id="smokingChart"></canvas>
                      </div>
                                <div className="table-responsive mt-3">
                                  <table className="table table-sm table-bordered">
                                    <thead>
                                      <tr>
                                        <th>Ngày</th>
                                        <th>Số điếu</th>
                                        <th>Cảm xúc</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {selectedUserDetail.smokingProfile.dailyLogs.map((log, index) => (
                                        <tr key={index}>
                                          <td>{new Date(log.date).toLocaleDateString('vi-VN')}</td>
                                          <td>{log.cigarettes}</td>
                                          <td>{log.feeling || 'Không ghi chú'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                    </div>
                              </div>
                            )}
                  </div>
                </div>
                  )}

                  {/* Kế hoạch cai thuốc */}
                  {selectedUserDetail.quitPlan && (
                        <div className="card mb-3">
                          <div className="card-header bg-success text-white">
                            <strong>📋 Kế hoạch cai thuốc</strong>
                          </div>
                          <div className="card-body">
                            <h5 className="card-title">{selectedUserDetail.quitPlan.title}</h5>
                            <p className="card-text">{selectedUserDetail.quitPlan.description}</p>
                            <div className="row g-3">
                              <div className="col-md-4">
                                <strong>Ngày bắt đầu:</strong> {new Date(selectedUserDetail.quitPlan.startDate).toLocaleDateString('vi-VN')}
                              </div>
                              <div className="col-md-4">
                                <strong>Ngày mục tiêu:</strong> {new Date(selectedUserDetail.quitPlan.targetDate).toLocaleDateString('vi-VN')}
                              </div>
                              <div className="col-md-4">
                                <strong>Tiến độ:</strong> {selectedUserDetail.quitPlan.progress}%
                              </div>
                            </div>
                            <div className="mt-3">
                              <strong>Chi tiết kế hoạch:</strong>
                              <pre className="mt-2 bg-light p-3 rounded" style={{ whiteSpace: 'pre-wrap' }}>
                                {selectedUserDetail.quitPlan.planDetail}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="d-flex justify-content-center align-items-center p-4">
                      <span>Đang tải chi tiết người dùng...</span>
                    </div>
                  )}
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-primary" onClick={handleCloseDetail}>Đóng</button>
                </div>
              </div>
            </div>
          </div>

          {/* Bootstrap Alert for notifications */}
          {snackbar.open && (
            <div className={`alert alert-${snackbar.severity} alert-dismissible fade show position-fixed top-0 end-0 m-4`} role="alert" style={{ zIndex: 2000, minWidth: 320 }}>
              {snackbar.message}
              <button type="button" className="btn-close" onClick={handleSnackbarClose}></button>
            </div>
          )}
        </div>
      </div>
      <div className="mb-3">
        <Link to="/admin/feedback" className="btn btn-outline-primary">
          Đánh giá của khách hàng
        </Link>
      </div>
    </div>
  );
};

export default AdminUserPage;
