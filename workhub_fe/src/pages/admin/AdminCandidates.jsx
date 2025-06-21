import React, { useEffect, useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser, getUserById, getResumesByUser, createResumeByAdmin, deleteResume, getResumeFileBase64 } from '../../apiService';

export default function AdminCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ fullname: '', email: '', password: '', phone: '', role: 'candidate', status: 'verified' });
  const [resumes, setResumes] = useState([]);
  const [showResumeForm, setShowResumeForm] = useState(false);
  const [resumeTitle, setResumeTitle] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const token = localStorage.getItem('token');
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  // Lấy danh sách ứng viên
  const fetchCandidates = async () => {
    try {
      const res = await getUsers({ ...config, params: { role: 'candidate' } });
      setCandidates(res.data);
    } catch {
      setCandidates([]);
    }
  };
  useEffect(() => { fetchCandidates(); }, []);

  // Lấy CV của ứng viên
  const fetchResumes = async (userId) => {
    try {
      const res = await getResumesByUser(userId, config);
      setResumes(res.data);
    } catch {
      setResumes([]);
    }
  };

  // Thêm/sửa ứng viên
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCandidate) {
        await updateUser(selectedCandidate.id, formData, config);
      } else {
        await createUser(formData, config);
      }
      setShowForm(false);
      setSelectedCandidate(null);
      setFormData({ fullname: '', email: '', password: '', phone: '', role: 'candidate', status: 'verified' });
      fetchCandidates();
    } catch {
      alert('Lưu thất bại!');
    }
  };
  // Xóa ứng viên
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa ứng viên này?')) return;
    try {
      await deleteUser(id, config);
      fetchCandidates();
    } catch {
      alert('Xóa thất bại!');
    }
  };
  // Xem/sửa ứng viên
  const handleEdit = async (id) => {
    setSelectedCandidate(candidates.find(u => u.id === id));
    setShowForm(true);
    const res = await getUserById(id, config);
    setFormData({ ...res.data, password: '' });
    fetchResumes(id);
  };
  // Thêm CV
  const handleAddResume = async (e) => {
    e.preventDefault();
    if (!resumeFile || !resumeTitle) return;
    const form = new FormData();
    form.append('file', resumeFile);
    form.append('title', resumeTitle);
    form.append('content', '');
    form.append('skillIds', []);
    try {
      await createResumeByAdmin(selectedCandidate.id, form, config);
      setShowResumeForm(false);
      setResumeFile(null);
      setResumeTitle('');
      fetchResumes(selectedCandidate.id);
    } catch {
      alert('Thêm CV thất bại!');
    }
  };
  // Xóa CV
  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm('Bạn có chắc muốn xóa CV này?')) return;
    try {
      await deleteResume(resumeId, config);
      fetchResumes(selectedCandidate.id);
    } catch {
      alert('Xóa CV thất bại!');
    }
  };
  // Xem CV
  const handleViewResume = async (resumeId, title) => {
    try {
      const response = await getResumeFileBase64(resumeId, config);
      const base64 = response.data;
      const pdfWindow = window.open('');
      pdfWindow.document.write(`<title>${title || 'CV'}</title><iframe width='100%' height='100%' src='data:application/pdf;base64,${base64}'></iframe>`);
    } catch {
      alert('Không xem được CV!');
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Quản lý ứng viên</h2>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => { setShowForm(true); setSelectedCandidate(null); setFormData({ fullname: '', email: '', password: '', phone: '', role: 'candidate', status: 'verified' }); }}>Thêm ứng viên</button>
      <table className="w-full border mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">ID</th>
            <th className="p-2">Tên</th>
            <th className="p-2">Email</th>
            <th className="p-2">Số điện thoại</th>
            <th className="p-2">Trạng thái</th>
            <th className="p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map(u => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.id}</td>
              <td className="p-2">{u.fullname}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.phone || '-'}</td>
              <td className="p-2">{u.status}</td>
              <td className="p-2 flex gap-2">
                <button className="bg-primary text-white px-3 py-1 rounded text-xs" onClick={() => handleEdit(u.id)}>Sửa</button>
                <button className="bg-red-500 text-white px-3 py-1 rounded text-xs" onClick={() => handleDelete(u.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Form thêm/sửa ứng viên */}
      {showForm && (
        <form className="bg-white rounded-xl shadow p-6 mb-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border p-2 rounded" placeholder="Họ tên" value={formData.fullname} onChange={e => setFormData(f => ({ ...f, fullname: e.target.value }))} required />
            <input className="border p-2 rounded" placeholder="Email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} required />
            <input className="border p-2 rounded" placeholder="Số điện thoại" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
            <input className="border p-2 rounded" placeholder="Mật khẩu" type="password" value={formData.password} onChange={e => setFormData(f => ({ ...f, password: e.target.value }))} required={!selectedCandidate} />
            <select className="border p-2 rounded" value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}>
              <option value="verified">Đã xác thực</option>
              <option value="unverified">Chưa xác thực</option>
              <option value="suspended">Tạm ngưng</option>
              <option value="banned">Bị cấm</option>
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">{selectedCandidate ? 'Cập nhật' : 'Thêm mới'}</button>
            <button className="px-4 py-2 bg-gray-300 rounded" type="button" onClick={() => { setShowForm(false); setSelectedCandidate(null); }}>Hủy</button>
          </div>
          {/* Quản lý CV của ứng viên */}
          {selectedCandidate && (
            <div className="mt-8">
              <h4 className="font-bold mb-2">CV của ứng viên</h4>
              <button className="mb-2 px-3 py-1 bg-green-600 text-white rounded" type="button" onClick={() => setShowResumeForm(true)}>Thêm CV</button>
              <ul className="list-disc ml-6">
                {resumes.map(r => (
                  <li key={r.id} className="mb-1 flex items-center gap-2">
                    <span>{r.title}</span>
                    <button className="text-blue-600 underline" type="button" onClick={() => handleViewResume(r.id, r.title)}>Xem</button>
                    <button className="text-red-500 underline" type="button" onClick={() => handleDeleteResume(r.id)}>Xóa</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
      )}
      {/* Form thêm CV */}
      {showResumeForm && (
        <form className="bg-white rounded-xl shadow p-6 mb-6" onSubmit={handleAddResume}>
          <h4 className="font-bold mb-2">Thêm CV mới</h4>
          <input className="border p-2 rounded mb-2 w-full" placeholder="Tiêu đề CV" value={resumeTitle} onChange={e => setResumeTitle(e.target.value)} required />
          <input className="border p-2 rounded mb-2 w-full" type="file" accept="application/pdf" onChange={e => setResumeFile(e.target.files[0])} required />
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Thêm</button>
            <button className="px-4 py-2 bg-gray-300 rounded" type="button" onClick={() => setShowResumeForm(false)}>Hủy</button>
          </div>
        </form>
      )}
    </div>
  );
}
