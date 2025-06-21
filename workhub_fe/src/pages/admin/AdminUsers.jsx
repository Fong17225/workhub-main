import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, createUser, updateUser, deleteUser, getUserById } from '../../apiService';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ fullname: '', email: '', password: '', phone: '', role: 'candidate', status: 'verified' });
  const [editId, setEditId] = useState(null);

  const navigate = useNavigate();

  // Lấy token từ localStorage
  const token = localStorage.getItem('token');
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Lấy toàn bộ user, không truyền params role
      const res = await getUsers(config);
      setUsers(res.data);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        navigate('/login');
      } else {
        setUsers([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleEdit = async (id) => {
    setEditId(id);
    setShowForm(true);
    const res = await getUserById(id, config);
    setFormData({ ...res.data, password: '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa user này?')) {
      await deleteUser(id, config);
      fetchUsers();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await updateUser(editId, formData, config);
    } else {
      await createUser(formData, config);
    }
    setShowForm(false);
    setEditId(null);
    setFormData({ fullname: '', email: '', password: '', phone: '', role: 'candidate', status: 'verified' });
    fetchUsers();
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Quản lý người dùng</h2>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => { setShowForm(true); setEditId(null); setFormData({ fullname: '', email: '', password: '', phone: '', role: 'candidate', status: 'verified' }); }}>Thêm user</button>
      {showForm && (
        <form className="bg-white rounded-xl shadow p-6 mb-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border p-2 rounded" placeholder="Họ tên" value={formData.fullname} onChange={e => setFormData(f => ({ ...f, fullname: e.target.value }))} required />
            <input className="border p-2 rounded" placeholder="Email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} required />
            <input className="border p-2 rounded" placeholder="Số điện thoại" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
            <input className="border p-2 rounded" placeholder="Mật khẩu" type="password" value={formData.password} onChange={e => setFormData(f => ({ ...f, password: e.target.value }))} required={!editId} />
            <select className="border p-2 rounded" value={formData.role} onChange={e => setFormData(f => ({ ...f, role: e.target.value }))}>
              <option value="candidate">Ứng viên</option>
              <option value="recruiter">Nhà tuyển dụng</option>
              <option value="admin">Admin</option>
            </select>
            <select className="border p-2 rounded" value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}>
              <option value="verified">Đã xác thực</option>
              <option value="unverified">Chưa xác thực</option>
              <option value="suspended">Tạm ngưng</option>
              <option value="banned">Bị cấm</option>
            </select>
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
                <th className="p-2">Tên</th>
                <th className="p-2">Email</th>
                <th className="p-2">Số điện thoại</th>
                <th className="p-2">Vai trò</th>
                <th className="p-2">Trạng thái</th>
                <th className="p-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t">
                  <td className="p-2">{user.id}</td>
                  <td className="p-2">{user.fullname}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.phone || '-'}</td>
                  <td className="p-2">{user.role}</td>
                  <td className="p-2">{user.status}</td>
                  <td className="p-2 flex gap-2">
                    <button className="bg-primary text-white px-3 py-1 rounded text-xs" onClick={() => handleEdit(user.id)}>Sửa</button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded text-xs" onClick={() => handleDelete(user.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
