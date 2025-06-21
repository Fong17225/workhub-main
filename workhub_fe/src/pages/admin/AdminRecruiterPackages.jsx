import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { updateUserPackage, deleteUserPackage, createUserPackage } from '../../api/userPackageAdmin';
import { getUsers, getServicePackages } from '../../apiService';

const API_BASE_URL = 'http://localhost:8080/workhub/api/v1';

export default function AdminRecruiterPackages() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ userId: '', packageId: '', purchaseDate: '', expirationDate: '', status: 'active' });
  const [users, setUsers] = useState([]);
  const [packages, setPackages] = useState([]);
  const token = localStorage.getItem('token');
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(`${API_BASE_URL}/user-packages`, config),
      getUsers(config),
      getServicePackages(config)
    ])
      .then(([res, userRes, pkgRes]) => {
        setData(res.data);
        setUsers(userRes.data);
        setPackages(pkgRes.data);
      })
      .catch(() => {
        setData([]);
        setUsers([]);
        setPackages([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = (item) => {
    setEditItem(item);
    setForm({
      userId: item.user?.id || '',
      packageId: item.servicePackage?.id || '',
      purchaseDate: item.purchaseDate?.slice(0, 10) || '',
      expirationDate: item.expirationDate?.slice(0, 10) || '',
      status: item.status || 'active',
    });
    setShowForm(true);
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa?')) return;
    await deleteUserPackage(id, config);
    window.location.reload();
  };
  const handleAdd = () => {
    setEditItem(null);
    setForm({ userId: '', packageId: '', purchaseDate: '', expirationDate: '', status: 'active' });
    setShowForm(true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Lấy thông tin gói để tự động điền price, description
    const selectedPackage = packages.find(p => String(p.id) === String(form.packageId));
    const payload = {
      user: { id: form.userId },
      servicePackage: { id: form.packageId },
      purchaseDate: form.purchaseDate ? form.purchaseDate + 'T00:00:00' : null,
      expirationDate: form.expirationDate ? form.expirationDate + 'T00:00:00' : null,
      status: form.status,
      price: selectedPackage ? selectedPackage.price : 0,
      description: selectedPackage ? selectedPackage.description : '',
    };
    if (editItem) {
      await updateUserPackage(editItem.id, payload, config);
    } else {
      await createUserPackage(payload, config);
    }
    setShowForm(false);
    window.location.reload();
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Quản lý tài khoản recruiter đã mua gói</h2>
      {loading ? 'Đang tải...' : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Recruiter</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Gói dịch vụ</th>
                <th className="border px-4 py-2">Ngày mua</th>
                <th className="border px-4 py-2">Ngày hết hạn</th>
                <th className="border px-4 py-2">Trạng thái</th>
                <th className="border px-4 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {data.filter(up => up.user?.role === 'recruiter').map(up => (
                <tr key={up.id}>
                  <td className="border px-4 py-2">{up.user?.id}</td>
                  <td className="border px-4 py-2">{up.user?.fullname}</td>
                  <td className="border px-4 py-2">{up.user?.email}</td>
                  <td className="border px-4 py-2">{up.servicePackage?.name}</td>
                  <td className="border px-4 py-2">{up.purchaseDate?.slice(0,10)}</td>
                  <td className="border px-4 py-2">{up.expirationDate?.slice(0,10)}</td>
                  <td className="border px-4 py-2">{up.status}</td>
                  <td className="border px-4 py-2">
                    <button className="px-2 py-1 bg-yellow-400 rounded mr-2" onClick={() => handleEdit(up)}>Sửa</button>
                    <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => handleDelete(up.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleAdd}>Thêm mới</button>
      {showForm && (
        <form className="bg-white rounded-xl shadow p-6 mb-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select className="border p-2 rounded" name="userId" value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} required>
              <option value="">Chọn user</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.fullname} ({u.email}) - {u.role}</option>)}
            </select>
            <select className="border p-2 rounded" name="packageId" value={form.packageId} onChange={e => setForm(f => ({ ...f, packageId: e.target.value }))} required>
              <option value="">Chọn gói dịch vụ</option>
              {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input className="border p-2 rounded" name="purchaseDate" type="date" placeholder="Ngày mua" value={form.purchaseDate} onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))} required />
            <input className="border p-2 rounded" name="expirationDate" type="date" placeholder="Ngày hết hạn" value={form.expirationDate} onChange={e => setForm(f => ({ ...f, expirationDate: e.target.value }))} required />
            <select className="border p-2 rounded" name="status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} required>
              <option value="active">active</option>
              <option value="expired">expired</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Lưu</button>
            <button className="px-4 py-2 bg-gray-300 rounded" type="button" onClick={() => setShowForm(false)}>Hủy</button>
          </div>
        </form>
      )}
    </div>
  );
}
