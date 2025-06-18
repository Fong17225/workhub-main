import React from 'react';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard Nhà Tuyển Dụng</h1>
          <p className="text-gray-700">Chào mừng bạn đến với trang quản lý dành cho nhà tuyển dụng. Tại đây bạn có thể quản lý các tin tuyển dụng, xem danh sách ứng viên ứng tuyển, và nhiều chức năng khác.</p>
          {/* Thêm các thành phần dashboard recruiter ở đây */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
