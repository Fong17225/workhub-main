import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const adminFunctions = [
  { title: 'Thống kê', path: '/admin/stats', icon: '📊' },
  { title: 'Quản lý người dùng', path: '/admin/users', icon: '👤' },
  { title: 'Quản lý ứng viên', path: '/admin/candidates', icon: '🧑‍💼' },
  { title: 'Quản lý công việc', path: '/admin/jobs', icon: '💼' },
  { title: 'Quản lý loại công việc', path: '/admin/job-types', icon: '🗂️' },
  { title: 'Quản lý vị trí công việc', path: '/admin/job-positions', icon: '📌' },
  { title: 'Quản lý danh mục công việc', path: '/admin/job-categories', icon: '📚' },
  { title: 'Quản lý công ty', path: '/admin/company-manager', icon: '🏭' },
  { title: 'Quản lý ứng tuyển', path: '/admin/applications', icon: '📝' },
  { title: 'Quản lý phỏng vấn', path: '/admin/interviews', icon: '🎤' },
  { title: 'Quản lý kỹ năng & gói dịch vụ', path: '/admin/services', icon: '🎯' },
  { title: 'Quản lý thông báo & tin nhắn', path: '/admin/communications', icon: '✉️' },
  { title: 'Quản lý đánh giá & hồ sơ', path: '/admin/profiles', icon: '📄' },
  { title: 'Quản lý giao dịch', path: '/admin/transactions', icon: '💳' },
  { title: 'Nhật ký hoạt động admin', path: '/admin/admin-logs', icon: '📋' },
];

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col min-h-screen">
        <div className="h-16 flex items-center justify-center border-b">
          <span className="text-2xl font-bold text-blue-700 tracking-wide">WorkHub Admin</span>
        </div>
        <nav className="flex-1 py-6">
          {adminFunctions.map((func) => (
            <Link
              key={func.title}
              to={func.path}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition rounded-lg mx-2 my-1 ${location.pathname === func.path ? 'bg-blue-50 text-blue-700 font-bold' : ''}`}
            >
              <span className="text-xl mr-3">{func.icon}</span>
              <span className="font-medium">{func.title}</span>
            </Link>
          ))}
        </nav>
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white shadow flex items-center px-8 justify-between">
          <h1 className="text-2xl font-bold text-blue-700">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Xin chào, Admin!</span>
            <img src="https://themewagon.github.io/argon-dashboard-tailwind/assets/img/team-2.jpg" alt="avatar" className="w-10 h-10 rounded-full border" />
          </div>
        </header>
        {/* Chỉ giữ lại phần nội dung động, không render các card quản trị ở giữa */}
      </div>
    </div>
  );
}
