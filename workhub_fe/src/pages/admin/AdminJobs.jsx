import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminJobs, getJobById, getJobCategories, getJobTypes, getJobPositions, getRecruiters, updateAdminJob, createAdminJob, deleteAdminJob } from '../../apiService';

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', salaryRange: '', experience: '', location: '', recruiterId: '', categoryId: '', typeId: '', positionId: '' });
  const [editId, setEditId] = useState(null);
  const [recruiters, setRecruiters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [positions, setPositions] = useState([]);

  const navigate = useNavigate();

  // Lấy token từ localStorage
  const token = localStorage.getItem('token');
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await getAdminJobs(config);
      setJobs(res.data);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        navigate('/login');
      } else {
        setJobs([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
    const fetchRecruiters = async () => {
      try { const res = await getRecruiters(config); setRecruiters(res.data); } catch {}
    };
    const fetchCategories = async () => {
      try { const res = await getJobCategories(config); setCategories(res.data); } catch {}
    };
    const fetchTypes = async () => {
      try { const res = await getJobTypes(config); setTypes(res.data); } catch {}
    };
    const fetchPositions = async () => {
      try { const res = await getJobPositions(config); setPositions(res.data); } catch {}
    };
    fetchRecruiters();
    fetchCategories();
    fetchTypes();
    fetchPositions();
  }, []);

  const handleView = async (id) => {
    const res = await getJobById(id, config);
    setSelectedJob(res.data);
  };

  // CRUD handlers
  const handleEdit = async (id) => {
    setEditId(id);
    setShowForm(true);
    const res = await getJobById(id, config);
    setFormData({
      title: res.data.title || '',
      description: res.data.description || '',
      salaryRange: res.data.salaryRange || '',
      experience: res.data.experience || '',
      location: res.data.location || '',
      recruiterId: res.data.recruiterId ? String(res.data.recruiterId) : (res.data.recruiter?.id ? String(res.data.recruiter.id) : ''),
      categoryId: res.data.categoryId ? String(res.data.categoryId) : (res.data.category?.id ? String(res.data.category.id) : ''),
      typeId: res.data.typeId ? String(res.data.typeId) : (res.data.type?.id ? String(res.data.type.id) : ''),
      positionId: res.data.positionId ? String(res.data.positionId) : (res.data.position?.id ? String(res.data.position.id) : '')
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa job này?')) {
      await deleteAdminJob(id, config);
      fetchJobs();
    }
  };

  const buildJobPayload = (formData) => ({
    title: formData.title,
    description: formData.description,
    salaryRange: formData.salaryRange,
    experience: formData.experience,
    location: formData.location,
    recruiter: formData.recruiterId ? { id: Number(formData.recruiterId) } : null,
    category: formData.categoryId ? { id: Number(formData.categoryId) } : null,
    type: formData.typeId ? { id: Number(formData.typeId) } : null,
    position: formData.positionId ? { id: Number(formData.positionId) } : null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = buildJobPayload(formData);
    if (editId) {
      await updateAdminJob(editId, payload, config);
    } else {
      await createAdminJob(payload, config);
    }
    setShowForm(false);
    setEditId(null);
    setFormData({ title: '', description: '', salaryRange: '', experience: '', location: '', recruiterId: '', categoryId: '', typeId: '', positionId: '' });
    fetchJobs();
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Quản lý công việc</h2>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => { setShowForm(true); setEditId(null); setFormData({ title: '', description: '', salaryRange: '', experience: '', location: '', recruiterId: '', categoryId: '', typeId: '', positionId: '' }); }}>Thêm job</button>
      {showForm && (
        <form className="bg-white rounded-xl shadow p-6 mb-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border p-2 rounded" placeholder="Tiêu đề" value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} required />
            <input className="border p-2 rounded" placeholder="Lương" value={formData.salaryRange} onChange={e => setFormData(f => ({ ...f, salaryRange: e.target.value }))} />
            <input className="border p-2 rounded" placeholder="Kinh nghiệm" value={formData.experience} onChange={e => setFormData(f => ({ ...f, experience: e.target.value }))} />
            <input className="border p-2 rounded" placeholder="Địa điểm" value={formData.location} onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} />
            <select className="border p-2 rounded" value={formData.recruiterId} onChange={e => setFormData(f => ({ ...f, recruiterId: e.target.value }))} required>
              <option value="">Chọn nhà tuyển dụng</option>
              {recruiters.map(r => <option key={r.id} value={r.id}>{r.fullname}</option>)}
            </select>
            <select className="border p-2 rounded" value={formData.categoryId} onChange={e => setFormData(f => ({ ...f, categoryId: e.target.value }))} required>
              <option value="">Chọn ngành nghề</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="border p-2 rounded" value={formData.typeId} onChange={e => setFormData(f => ({ ...f, typeId: e.target.value }))} required>
              <option value="">Chọn loại công việc</option>
              {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select className="border p-2 rounded" value={formData.positionId} onChange={e => setFormData(f => ({ ...f, positionId: e.target.value }))} required>
              <option value="">Chọn vị trí</option>
              {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <textarea className="border p-2 rounded col-span-2" placeholder="Mô tả" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="mt-4 flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">{editId ? 'Cập nhật' : 'Thêm mới'}</button>
            <button className="px-4 py-2 bg-gray-300 rounded" type="button" onClick={() => { setShowForm(false); setEditId(null); }}>Hủy</button>
          </div>
        </form>
      )}
      <div className="bg-white rounded-xl shadow p-6">
        {loading ? 'Đang tải...' : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">ID</th>
                <th className="p-2">Tiêu đề</th>
                <th className="p-2">Nhà tuyển dụng</th>
                <th className="p-2">Ngành nghề</th>
                <th className="p-2">Loại</th>
                <th className="p-2">Vị trí</th>
                <th className="p-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id} className="border-t">
                  <td className="p-2">{job.id}</td>
                  <td className="p-2">{job.title}</td>
                  <td className="p-2">{job.recruiterUsername || job.recruiterFullname || job.recruiter?.fullname || '-'}</td>
                  <td className="p-2">{job.category || '-'}</td>
                  <td className="p-2">{job.type || '-'}</td>
                  <td className="p-2">{job.position || '-'}</td>
                  <td className="p-2 flex gap-2">
                    <button className="bg-primary text-white px-3 py-1 rounded text-xs" onClick={() => handleView(job.id)}>Xem</button>
                    <button className="bg-yellow-500 text-white px-3 py-1 rounded text-xs" onClick={() => handleEdit(job.id)}>Sửa</button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded text-xs" onClick={() => handleDelete(job.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {selectedJob && (
        <div className="mt-8 bg-white rounded shadow p-6">
          <h3 className="text-lg font-bold mb-2">Chi tiết công việc: {selectedJob.title}</h3>
          <div><b>Nhà tuyển dụng:</b> {selectedJob.recruiterFullname || selectedJob.recruiter?.fullname || '-'}</div>
          <div><b>Ngành nghề:</b> {selectedJob.category || '-'}</div>
          <div><b>Loại:</b> {selectedJob.type || '-'}</div>
          <div><b>Vị trí:</b> {selectedJob.position || '-'}</div>
          <div><b>Mô tả:</b> {selectedJob.description}</div>
          <div><b>Lương:</b> {selectedJob.salaryRange}</div>
          <div><b>Kinh nghiệm:</b> {selectedJob.experience}</div>
          <div><b>Địa điểm:</b> {selectedJob.location}</div>
          <div><b>Hạn nộp:</b> {selectedJob.deadline}</div>
          <button className="mt-4 px-4 py-2 bg-gray-200 rounded" onClick={() => setSelectedJob(null)}>Đóng</button>
        </div>
      )}
    </div>
  );
}
