import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CoachMemberProgressPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progressHistory, setProgressHistory] = useState([]);
  const [memberInfo, setMemberInfo] = useState(null);
  const [smokingProfile, setSmokingProfile] = useState(null);
  const [coachQuitPlan, setCoachQuitPlan] = useState(null);
  const [systemQuitPlan, setSystemQuitPlan] = useState(null);
  const navigate = useNavigate();
  const { memberId } = useParams();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (memberId) {
      setLoading(true);
      setError('');
      
      // Kiểm tra xem member có được gán cho coach này không trước khi lấy tiến trình
      axios.get(`http://localhost:5000/api/coach/members`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          const assignedMembers = res.data.members || [];
          const isAssigned = assignedMembers.some(member => member.Id === parseInt(memberId));
          
          if (!isAssigned) {
            setError('Bạn không có quyền xem tiến trình của thành viên này.');
            setLoading(false);
            return;
          }

          // Nếu được gán, lấy thông tin tiến trình
          return axios.get(`http://localhost:5000/api/coach/member/${memberId}/progress`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        })
        .then(res => {
          if (res && res.data) {
            setProgressHistory(res.data.history || []);
            setSmokingProfile(res.data.smokingProfile || null);
            setCoachQuitPlan(res.data.coachQuitPlan || null);
            setSystemQuitPlan(res.data.systemQuitPlan || null);
          }
        })
        .catch((err) => {
          console.error('Error fetching progress:', err);
          if (err.response?.status === 403) {
            setError('Bạn không có quyền xem tiến trình của thành viên này.');
          } else {
            setError('Không thể tải tiến trình của thành viên.');
          }
        })
        .finally(() => setLoading(false));

      // Lấy thông tin member
      axios.get(`http://localhost:5000/api/user/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setMemberInfo(res.data))
        .catch(() => {});
    } else {
      setLoading(true);
      setError('');
      
      // Lấy danh sách thành viên được gán cho coach
      axios.get('http://localhost:5000/api/coach/members', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          const assignedMembers = res.data.members || [];
          setMembers(assignedMembers);
        })
        .catch((err) => {
          console.error('Error fetching assigned members:', err);
          setError('Không thể tải danh sách thành viên được gán.');
        })
        .finally(() => setLoading(false));
    }
  }, [memberId]);

  if (loading) return <div className="container py-5 text-center">Đang tải dữ liệu...</div>;
  if (error) return (
    <div className="container py-5 text-center">
      <div className="alert alert-danger">{error}</div>
      <button className="btn btn-primary" onClick={() => navigate('/coach/members/progress')}>
        Quay lại danh sách
      </button>
    </div>
  );

  if (memberId) {
    // Chuẩn bị dữ liệu biểu đồ
    const chartData = {
      labels: progressHistory.map(log => log.date ? new Date(log.date).toLocaleDateString() : ''),
      datasets: [
        {
          label: 'Số điếu thuốc mỗi ngày',
          data: progressHistory.map(log => log.cigarettes),
          fill: false,
          borderColor: '#1976d2',
          backgroundColor: '#1976d2',
          tension: 0.2
        }
      ]
    };
    const chartOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Biểu đồ số điếu thuốc theo ngày' }
      }
    };

    return (
      <div className="container py-4 mt-5">
        <button className="btn btn-link mb-3" onClick={() => navigate('/coach/members/progress')}>
          &larr; Quay lại danh sách
        </button>
        <h3 className="mb-4">Tiến trình của thành viên {memberInfo?.username || memberId}</h3>

        {/* Thông tin hồ sơ hút thuốc */}
        {smokingProfile && (
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Thông tin hồ sơ hút thuốc</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Số điếu/ngày:</strong> {smokingProfile.cigarettesPerDay}</p>
                  <p><strong>Loại thuốc:</strong> {smokingProfile.cigaretteType}</p>
                  <p><strong>Tần suất hút:</strong> {smokingProfile.smokingFrequency}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Lý do cai:</strong> {smokingProfile.quitReason}</p>
                  <p><strong>Tình trạng sức khỏe:</strong> {smokingProfile.healthStatus}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kế hoạch do coach gán */}
        {coachQuitPlan && (
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Kế hoạch cai thuốc do coach gán</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Ngày bắt đầu:</strong> {coachQuitPlan.startDate}</p>
                  <p><strong>Ngày mục tiêu:</strong> {coachQuitPlan.targetDate}</p>
                  <p><strong>Số điếu ban đầu:</strong> {coachQuitPlan.initialCigarettes}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Giảm mỗi ngày:</strong> {coachQuitPlan.dailyReduction}</p>
                  <p><strong>Mô tả:</strong> {coachQuitPlan.planDetail}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kế hoạch mẫu hệ thống */}
        {systemQuitPlan && (
          <div className="card mb-4">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Kế hoạch mẫu hệ thống</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Ngày bắt đầu:</strong> {systemQuitPlan.startDate}</p>
                  <p><strong>Ngày mục tiêu:</strong> {systemQuitPlan.targetDate}</p>
                  <p><strong>Số điếu ban đầu:</strong> {systemQuitPlan.initialCigarettes}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Giảm mỗi ngày:</strong> {systemQuitPlan.dailyReduction}</p>
                  <p><strong>Mô tả:</strong> {systemQuitPlan.planDetail}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Biểu đồ tiến trình */}
        {progressHistory.length > 0 && (
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Biểu đồ tiến trình</h5>
            </div>
            <div className="card-body">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Bảng lịch sử nhật ký */}
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Lịch sử nhật ký hút thuốc</h5>
          </div>
          <div className="card-body">
            {progressHistory.length === 0 ? (
              <div className="alert alert-info">Chưa có nhật ký tiến trình nào.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Ngày</th>
                      <th>Số điếu thuốc</th>
                      <th>Cảm xúc/Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progressHistory.map((log, idx) => (
                      <tr key={idx}>
                        <td>{log.date ? new Date(log.date).toLocaleDateString('vi-VN') : ''}</td>
                        <td>
                          <span className="badge bg-primary">{log.cigarettes}</span>
                        </td>
                        <td>{log.feeling || 'Không có ghi chú'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 mt-5">
      <h3 className="mb-4">
        <i className="bi bi-people-fill me-2"></i>
        Danh sách thành viên được gán
      </h3>
      
      {members.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          Bạn chưa được gán thành viên nào.
        </div>
      ) : (
        <div className="row">
          {members.map(member => (
            <div key={member.Id} className="col-md-6 col-lg-4 mb-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-person-circle me-3" style={{ fontSize: '2rem', color: '#007bff' }}></i>
                    <div>
                      <h6 className="card-title mb-1">{member.Username}</h6>
                      <small className="text-muted">{member.Email}</small>
                    </div>
                  </div>
                  
                  {member.appointment && (
                    <div className="mb-3">
                      <small className="text-muted">
                        <i className="bi bi-calendar-event me-1"></i>
                        Lịch hẹn: {new Date(member.appointment.slotDate).toLocaleDateString('vi-VN')}
                      </small>
                    </div>
                  )}
                  
                  <button 
                    className="btn btn-primary w-100"
                    onClick={() => navigate(`/coach/member/${member.Id}/progress`)}
                  >
                    <i className="bi bi-graph-up me-2"></i>
                    Xem tiến trình
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoachMemberProgressPage; 