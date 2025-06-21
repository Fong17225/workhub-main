import React, { useEffect, useState } from 'react';
import { getCompanies, getCompanyById, getRecruiters, createCompanyByRecruiter, updateCompanyById, deleteCompanyById } from '../../apiService';

export default function AdminCompanyManager() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [recruiters, setRecruiters] = useState([]);
  const [formData, setFormData] = useState({ recruiterId: '', name: '', industry: '', location: '', description: '', website: '', status: 'active', inspection: 'none' });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await getCompanies(config);
        setCompanies(res.data);
      } catch {
        setCompanies([]);
      }
      setLoading(false);
    };
    const fetchRecruiters = async () => {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await getRecruiters(config);
      setRecruiters(res.data);
    };
    fetchCompanies();
    fetchRecruiters();
  }, []);

  const handleSelectCompany = async (companyId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await getCompanyById(companyId, config);
      setSelectedCompany(res.data);
    } catch {
      setSelectedCompany(null);
    }
    setLoading(false);
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!formData.recruiterId) return alert('Vui lòng chọn nhà tuyển dụng');
    const token = localStorage.getItem('token');
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    await createCompanyByRecruiter(formData.recruiterId, formData, config);
    setShowForm(false);
    setFormData({ recruiterId: '', name: '', industry: '', location: '', description: '', website: '', status: 'active', inspection: 'none' });
    // Refresh list
    const res = await getCompanies(config);
    setCompanies(res.data);
  };

  const handleEditCompany = () => {
    setEditMode(true);
    setFormData({
      recruiterId: selectedCompany.recruiter?.id || '',
      name: selectedCompany.name || '',
      industry: selectedCompany.industry || '',
      location: selectedCompany.location || '',
      description: selectedCompany.description || '',
      website: selectedCompany.website || '',
      status: selectedCompany.status || 'active',
      inspection: selectedCompany.inspection || 'none',
    });
    setShowForm(true);
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    if (!selectedCompany) return;
    const token = localStorage.getItem('token');
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    await updateCompanyById(selectedCompany.id, formData, config);
    setEditMode(false);
    setShowForm(false);
    setSelectedCompany(null);
    setFormData({ recruiterId: '', name: '', industry: '', location: '', description: '', website: '', status: 'active', inspection: 'none' });
    const res = await getCompanies(config);
    setCompanies(res.data);
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm('Bạn có chắc muốn xóa công ty này?')) return;
    const token = localStorage.getItem('token');
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    await deleteCompanyById(companyId, config);
    setSelectedCompany(null);
    const res = await getCompanies(config);
    setCompanies(res.data);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Quản lý công ty</h2>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setShowForm(f => !f)}>{showForm ? 'Đóng' : 'Tạo công ty mới'}</button>
      {showForm && (
        <form className="bg-white rounded-xl shadow p-6 mb-6" onSubmit={editMode ? handleUpdateCompany : handleCreateCompany}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select className="border p-2 rounded" value={formData.recruiterId} onChange={e => setFormData(f => ({ ...f, recruiterId: e.target.value }))} required>
              <option value="">Chọn nhà tuyển dụng</option>
              {recruiters.map(r => <option key={r.id} value={r.id}>{r.fullname} ({r.email})</option>)}
            </select>
            <input className="border p-2 rounded" placeholder="Tên công ty" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} required />
            <input className="border p-2 rounded" placeholder="Ngành nghề" value={formData.industry} onChange={e => setFormData(f => ({ ...f, industry: e.target.value }))} />
            <input className="border p-2 rounded" placeholder="Địa chỉ" value={formData.location} onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} />
            <input className="border p-2 rounded" placeholder="Website" value={formData.website} onChange={e => setFormData(f => ({ ...f, website: e.target.value }))} />
            <select className="border p-2 rounded" value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}>
              <option value="active">Hoạt động</option>
              <option value="pending">Chờ duyệt</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
            <select className="border p-2 rounded" value={formData.inspection} onChange={e => setFormData(f => ({ ...f, inspection: e.target.value }))}>
              <option value="none">Chưa kiểm định</option>
              <option value="prestige">Uy tín</option>
            </select>
            <textarea className="border p-2 rounded col-span-2" placeholder="Mô tả" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="mt-4 flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">{editMode ? 'Cập nhật công ty' : 'Tạo công ty'}</button>
            <button className="px-4 py-2 bg-gray-300 rounded" type="button" onClick={() => setShowForm(false)}>Hủy</button>
          </div>
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {companies.map(company => (
          <div
            key={company.id}
            className={`p-4 rounded shadow cursor-pointer border ${selectedCompany?.id === company.id ? 'border-blue-500 bg-blue-50' : 'bg-white'}`}
            onClick={() => handleSelectCompany(company.id)}
          >
            <div className="font-semibold text-blue-700">{company.name}</div>
            <div className="text-gray-500 text-sm">{company.email}</div>
            <div className="text-gray-400 text-xs">ID: {company.id}</div>
          </div>
        ))}
      </div>
      {selectedCompany && !showForm && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-bold mb-4 text-blue-700">Thông tin chi tiết công ty</h3>
          {loading ? 'Đang tải...' : (
            <div className="space-y-2">
              <div><b>ID:</b> {selectedCompany.id}</div>
              <div><b>Tên công ty:</b> {selectedCompany.name}</div>
              <div><b>Email recruiter:</b> {selectedCompany.recruiter?.email || '-'}</div>
              <div><b>Recruiter ID:</b> {selectedCompany.recruiter?.id || '-'}</div>
              <div><b>Industry:</b> {selectedCompany.industry || '-'}</div>
              <div><b>Location:</b> {selectedCompany.location || '-'}</div>
              <div><b>Description:</b> {selectedCompany.description || '-'}</div>
              <div><b>Website:</b> {selectedCompany.website || '-'}</div>
              <div><b>Inspection Status:</b> {selectedCompany.inspectionStatus || '-'}</div>
              <div><b>Inspection:</b> {selectedCompany.inspection || '-'}</div>
              <div><b>Status:</b> {selectedCompany.status || '-'}</div>
              <div><b>Created At:</b> {selectedCompany.createdAt || '-'}</div>
              <div><b>Logo:</b> {selectedCompany.logo ? <span className="text-green-600">Có file</span> : 'Không có'}</div>
              <div className="flex gap-2 mt-4">
                <button className="px-4 py-2 bg-yellow-500 text-white rounded" onClick={handleEditCompany}>Sửa</button>
                <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={() => handleDeleteCompany(selectedCompany.id)}>Xóa</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
