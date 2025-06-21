import React, { useEffect, useState } from 'react';
import { getServicePackages, createServicePackage, updateServicePackage, deleteServicePackage } from '../../apiService';

export default function AdminServicePackages() {
  const [packages, setPackages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', duration: '', description: '', status: 'active', jobPostLimit: 5, cvLimit: 5, postAt: 'standard' });
  const token = localStorage.getItem('token');
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const fetchPackages = async () => {
    const res = await getServicePackages(config);
    setPackages(res.data);
  };
  useEffect(() => { fetchPackages(); }, []);

  const handleEdit = (pkg) => {
    setEditId(pkg.id);
    setFormData({
      name: pkg.name || '',
      price: pkg.price || '',
      duration: pkg.duration || '',
      description: pkg.description || '',
      status: pkg.status || 'active',
      jobPostLimit: pkg.jobPostLimit || 5,
      cvLimit: pkg.cvLimit || 5,
      postAt: pkg.postAt || 'standard',
    });
    setShowForm(true);
  };
  const handleAdd = () => {
    setEditId(null);
    setFormData({ name: '', price: '', duration: '', description: '', status: 'active', jobPostLimit: 5, cvLimit: 5, postAt: 'standard' });
    setShowForm(true);
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa gói này?')) return;
    await deleteServicePackage(id, config);
    fetchPackages();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: formData.price ? parseFloat(formData.price) : 0,
      duration: formData.duration ? parseInt(formData.duration) : 0,
      jobPostLimit: formData.jobPostLimit ? parseInt(formData.jobPostLimit) : 5,
      cvLimit: formData.cvLimit ? parseInt(formData.cvLimit) : 5,
      postAt: formData.postAt,
      createdAt: new Date().toISOString(),
    };
    if (editId) {
      await updateServicePackage(editId, payload, config);
    } else {
      await createServicePackage(payload, config);
    }
    setShowForm(false);
    setEditId(null);
    setFormData({ name: '', price: '', duration: '', description: '', status: 'active', jobPostLimit: 5, cvLimit: 5, postAt: 'standard' });
    fetchPackages();
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Quản lý gói dịch vụ</h2>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleAdd}>Thêm gói mới</button>
      {showForm && (
        <form className="bg-white rounded-xl shadow p-6 mb-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border p-2 rounded" name="name" placeholder="Tên gói" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} required />
            <input className="border p-2 rounded" name="price" type="number" placeholder="Giá" value={formData.price} onChange={e => setFormData(f => ({ ...f, price: e.target.value }))} required />
            <input className="border p-2 rounded" name="duration" type="number" placeholder="Thời hạn (ngày)" value={formData.duration} onChange={e => setFormData(f => ({ ...f, duration: e.target.value }))} required />
            <input className="border p-2 rounded" name="jobPostLimit" type="number" placeholder="Giới hạn tin tuyển dụng" value={formData.jobPostLimit} onChange={e => setFormData(f => ({ ...f, jobPostLimit: e.target.value }))} required />
            <input className="border p-2 rounded" name="cvLimit" type="number" placeholder="Giới hạn CV" value={formData.cvLimit} onChange={e => setFormData(f => ({ ...f, cvLimit: e.target.value }))} required />
            <select className="border p-2 rounded" name="postAt" value={formData.postAt} onChange={e => setFormData(f => ({ ...f, postAt: e.target.value }))} required>
              <option value="standard">standard</option>
              <option value="urgent">urgent</option>
              <option value="proposal">proposal</option>
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Lưu</button>
            <button className="px-4 py-2 bg-gray-300 rounded" type="button" onClick={() => setShowForm(false)}>Hủy</button>
          </div>
        </form>
      )}
      <div className="bg-white rounded-xl shadow p-6">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">ID</th>
              <th className="p-2">Tên gói</th>
              <th className="p-2">Giá</th>
              <th className="p-2">Thời hạn (ngày)</th>
              <th className="p-2">Trạng thái</th>
              <th className="p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {packages.map(pkg => (
              <tr key={pkg.id} className="border-t">
                <td className="p-2">{pkg.id}</td>
                <td className="p-2">{pkg.name}</td>
                <td className="p-2">{pkg.price}</td>
                <td className="p-2">{pkg.duration}</td>
                <td className="p-2">{pkg.status}</td>
                <td className="p-2 flex gap-2">
                  <button className="bg-yellow-500 text-white px-3 py-1 rounded text-xs" onClick={() => handleEdit(pkg)}>Sửa</button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded text-xs" onClick={() => handleDelete(pkg.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
