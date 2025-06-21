import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminCharts from '../../components/admin/AdminCharts';

export default function AdminStats() {
  const navigate = useNavigate();
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Thống kê & Biểu đồ hệ thống</h2>
      <AdminCharts />
    </div>
  );
}
