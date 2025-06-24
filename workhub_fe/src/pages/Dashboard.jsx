import React from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseIcon, UserGroupIcon, ClipboardDocumentListIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const recruiterStats = [
  { label: 'Tin tuyển dụng', value: 8, icon: <BriefcaseIcon className="w-6 h-6 text-blue-500" /> },
  { label: 'CV ứng viên', value: 25, icon: <UserGroupIcon className="w-6 h-6 text-green-500" /> },
  { label: 'Phiên phỏng vấn', value: 4, icon: <ClipboardDocumentListIcon className="w-6 h-6 text-yellow-500" /> },
  { label: 'Tin đã đăng', value: 12, icon: <DocumentTextIcon className="w-6 h-6 text-purple-500" /> },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          <div className="flex items-center gap-6 mb-8">
            <img src="/workhub-logo.png" alt="Recruiter Avatar" className="w-20 h-20 rounded-full border-4 border-primary shadow" />
            <div>
              <h1 className="text-3xl font-extrabold text-primary mb-1">Dashboard Nhà Tuyển Dụng</h1>
              <p className="text-gray-700">Chào mừng bạn đến với trang quản lý dành cho nhà tuyển dụng.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {recruiterStats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center bg-gradient-to-tr from-white to-blue-50 rounded-xl shadow p-4">
                {stat.icon}
                <div className="text-2xl font-bold text-primary mt-2">{stat.value}</div>
                <div className="text-gray-600 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/recruiter/job-manager" className="group block bg-blue-100 hover:bg-blue-200 rounded-2xl p-8 shadow-lg transition transform hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-2">
                <BriefcaseIcon className="w-7 h-7 text-blue-500 group-hover:text-blue-700" />
                <h2 className="text-xl font-semibold">Quản lý tin tuyển dụng</h2>
              </div>
              <p className="text-gray-700">Thêm, sửa, xoá và xem danh sách các tin tuyển dụng của bạn.</p>
            </Link>
            <Link to="/recruiter/cv-list" className="group block bg-green-100 hover:bg-green-200 rounded-2xl p-8 shadow-lg transition transform hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-2">
                <UserGroupIcon className="w-7 h-7 text-green-500 group-hover:text-green-700" />
                <h2 className="text-xl font-semibold">Danh sách CV ứng viên</h2>
              </div>
              <p className="text-gray-700">Xem và duyệt các CV ứng viên đã nộp vào các job của bạn.</p>
            </Link>
            <Link to="/recruiter/jobs" className="group block bg-yellow-100 hover:bg-yellow-200 rounded-2xl p-8 shadow-lg transition transform hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-2">
                <ClipboardDocumentListIcon className="w-7 h-7 text-yellow-500 group-hover:text-yellow-700" />
                <h2 className="text-xl font-semibold">Tạo phiên phỏng vấn</h2>
              </div>
              <p className="text-gray-700">Tạo session và slot phỏng vấn cho từng job.</p>
            </Link>
            <Link to="/recruiter/job-list" className="group block bg-purple-100 hover:bg-purple-200 rounded-2xl p-8 shadow-lg transition transform hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-2">
                <DocumentTextIcon className="w-7 h-7 text-purple-500 group-hover:text-purple-700" />
                <h2 className="text-xl font-semibold">Danh sách tin đã đăng</h2>
              </div>
              <p className="text-gray-700">Xem toàn bộ các job bạn đã đăng tuyển.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
