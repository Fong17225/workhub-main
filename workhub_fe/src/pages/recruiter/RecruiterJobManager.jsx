import React, { useEffect, useState } from 'react';
import { getJobs, createJob, getJobCategories, getJobTypes, getJobPositions, getUserPackages } from '../../apiService';
import { Link } from 'react-router-dom';

export default function RecruiterJobManager() {
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    jobType: '',
    salary: '',
    location: '',
    portAt: '',
    category: '',
    type: '',
    position: '',
    experience: '',
    salaryRange: ''
  });
  const [userPackages, setUserPackages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [positions, setPositions] = useState([]);
  const token = localStorage.getItem('token');
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  useEffect(() => {
    fetchJobs();
    fetchUserPackages();
    getJobCategories(config).then(res => setCategories(res.data || []));
    getJobTypes(config).then(res => setTypes(res.data || []));
    getJobPositions(config).then(res => setPositions(res.data || []));
  }, []);

  const fetchJobs = async () => {
    const res = await getJobs('', config);
    setJobs(res.data.filter(j => j.isMine)); // Giả sử API trả về isMine cho recruiter
  };

  const fetchUserPackages = async () => {
    const token = localStorage.getItem('token');
    const user = token ? JSON.parse(atob(token.split('.')[1])) : null;
    if (!user?.id) return;
    const res = await getUserPackages(user.id, config);
    console.log('DEBUG userPackages:', res.data); // Log tổng thể
    if (res.data && res.data.length > 0) {
      res.data.forEach((pkg, idx) => {
        console.log(`DEBUG servicePackage[${idx}]:`, pkg.servicePackage);
      });
    }
    setUserPackages(res.data || []);
  };

  // Helper: lấy danh sách postAt recruiter có quyền
  // ĐÃ KHÔNG DÙNG NỮA, giữ lại để tham khảo
  // const getAllowedPostAt = () => { ... }
  // const allowedPostAt = getAllowedPostAt();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      postAt: form.portAt,
      salaryRange: form.salaryRange || form.salary
    };
    // Map các trường category, type, position thành object { id: value } nếu là số hoặc string
    ['category', 'type', 'position'].forEach(field => {
      if (payload[field]) {
        payload[field] = { id: Number(payload[field]) };
      }
    });
    // Loại bỏ các trường có giá trị là ""
    Object.keys(payload).forEach(key => {
      if (payload[key] === "") delete payload[key];
    });
    console.log('DEBUG submit payload:', payload);
    try {
      await createJob(payload, config);
      setShowForm(false);
      setForm({
        title: '',
        description: '',
        jobType: '',
        salary: '',
        location: '',
        portAt: '',
        category: '',
        type: '',
        position: '',
        experience: '',
        salaryRange: ''
      });
      fetchJobs();
    } catch (err) {
      console.error('Create job error:', err?.response?.data || err);
      alert('Tạo job thất bại: ' + (err?.response?.data?.message || err.message));
    }
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
            <select
              className="border p-2 rounded"
              name="portAt"
              value={form.portAt}
              onChange={e => setForm(f => ({ ...f, portAt: e.target.value }))}
              required
            >
              <option value="">Chọn hình thức đăng bài</option>
              <option value="standard">Thông thường</option>
              <option value="proposal">Đề xuất</option>
              <option value="urgent">Khẩn cấp</option>
            </select>
            <select
              className="border p-2 rounded"
              name="category"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              required
            >
              <option value="">Chọn ngành nghề</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              className="border p-2 rounded"
              name="type"
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              required
            >
              <option value="">Chọn loại hình công việc</option>
              {types.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <select
              className="border p-2 rounded"
              name="position"
              value={form.position}
              onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
              required
            >
              <option value="">Chọn vị trí</option>
              {positions.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input className="border p-2 rounded" name="experience" placeholder="Kinh nghiệm (VD: 2 năm, Fresher, Senior...)" value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} required />
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
            <li key={job.id} className="border-b py-2 flex items-center justify-between">
              <span className="font-bold">{job.title}</span> - {job.location} - {job.salary}
              <Link to={`/recruiter/jobs/${job.id}/create-session`} className="ml-4 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">Tạo phiên phỏng vấn</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
