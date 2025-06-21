import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminCompanies() {
  const navigate = useNavigate();
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Quản lý công ty</h2>
      {/* TODO: Thêm bảng danh sách công ty, chức năng duyệt/xóa/cập nhật hồ sơ công ty */}
      <div className="bg-white rounded-xl shadow p-6 text-gray-500">Chức năng quản lý công ty sẽ hiển thị ở đây.</div>
    </div>
  );
}
