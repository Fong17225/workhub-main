import React, { useEffect, useState } from 'react';
import { getRecruiterJobs } from '../../apiService';
import { Link } from 'react-router-dom';

export default function RecruiterJobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await getRecruiterJobs(config); // Đúng endpoint cho recruiter
      setJobs(res.data || []);
    } catch (err) {
      setJobs([]);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Danh sách tin tuyển dụng đã đăng</h2>
      {loading ? (
        <div>Đang tải...</div>
      ) : jobs.length === 0 ? (
        <div>Chưa có tin tuyển dụng nào.</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Tiêu đề</th>
              <th className="border px-4 py-2">Vị trí</th>
              <th className="border px-4 py-2">Loại</th>
              <th className="border px-4 py-2">Trạng thái</th>
              <th className="border px-4 py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.id} className="border-t">
                <td className="border px-4 py-2 font-semibold">{job.title}</td>
                <td className="border px-4 py-2">{job.position?.name || '-'}</td>
                <td className="border px-4 py-2">{job.type?.name || '-'}</td>
                <td className="border px-4 py-2">{job.status || 'Đang đăng'}</td>
                <td className="border px-4 py-2">
                  <Link to={`/recruiter/jobs/${job.id}`} className="text-blue-600 underline mr-2">Xem chi tiết</Link>
                  <Link to={`/recruiter/jobs/${job.id}/create-session`} className="text-green-600 underline">Tạo phiên phỏng vấn</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
