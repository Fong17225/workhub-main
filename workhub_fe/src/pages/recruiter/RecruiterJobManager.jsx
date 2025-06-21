import React, { useEffect, useState } from 'react';
import { getJobs, createJob } from '../../apiService';

export default function RecruiterJobManager() {
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', jobType: '', salary: '', location: '' });
  const token = localStorage.getItem('token');
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const res = await getJobs('', config);
    setJobs(res.data.filter(j => j.isMine)); // Giả sử API trả về isMine cho recruiter
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createJob(form, config);
    setShowForm(false);
    setForm({ title: '', description: '', jobType: '', salary: '', location: '' });
    fetchJobs();
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Quản lý tin tuyển dụng</h2>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setShowForm(true)}>Thêm tin mới</button>
      {showForm && (
        <form className="bg-white rounded-xl shadow p-6 mb-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border p-2 rounded" name="title" placeholder="Tiêu đề" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            <input className="border p-2 rounded" name="jobType" placeholder="Loại công việc" value={form.jobType} onChange={e => setForm(f => ({ ...f, jobType: e.target.value }))} required />
            <input className="border p-2 rounded" name="salary" placeholder="Mức lương" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} required />
            <input className="border p-2 rounded" name="location" placeholder="Địa điểm" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required />
            <textarea className="border p-2 rounded col-span-2" name="description" placeholder="Mô tả công việc" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          </div>
          <div className="mt-4 flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Lưu</button>
            <button className="px-4 py-2 bg-gray-300 rounded" type="button" onClick={() => setShowForm(false)}>Hủy</button>
          </div>
        </form>
      )}
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-2">Danh sách tin tuyển dụng của bạn</h3>
        <ul>
          {jobs.map(job => (
            <li key={job.id} className="border-b py-2">
              <span className="font-bold">{job.title}</span> - {job.location} - {job.salary}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
