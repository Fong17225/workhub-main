import React, { useEffect, useState } from 'react';
import { getJobTypes, createJobType, updateJobType, deleteJobType } from '../../apiService';

const AdminJobTypes = () => {
  const [jobTypes, setJobTypes] = useState([]);
  const [newType, setNewType] = useState('');
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchJobTypes();
  }, []);

  const fetchJobTypes = async () => {
    const res = await getJobTypes();
    setJobTypes(res.data);
  };

  const handleAdd = async () => {
    if (!newType.trim()) return;
    await createJobType({ name: newType });
    setNewType('');
    fetchJobTypes();
  };

  const handleEdit = (id, name) => {
    setEditId(id);
    setEditValue(name);
  };

  const handleUpdate = async (id) => {
    await updateJobType(id, { name: editValue });
    setEditId(null);
    setEditValue('');
    fetchJobTypes();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa?')) {
      await deleteJobType(id);
      fetchJobTypes();
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Quản lý Loại Công Việc</h2>
      <div className="flex mb-4">
        <input
          className="border px-2 py-1 flex-1 rounded-l"
          value={newType}
          onChange={e => setNewType(e.target.value)}
          placeholder="Tên loại công việc mới"
        />
        <button className="bg-primary text-white px-4 py-1 rounded-r" onClick={handleAdd}>Thêm</button>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Tên loại</th>
            <th className="border px-2 py-1">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {jobTypes.map(type => (
            <tr key={type.id}>
              <td className="border px-2 py-1">{type.id}</td>
              <td className="border px-2 py-1">
                {editId === type.id ? (
                  <input
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    className="border px-2 py-1"
                  />
                ) : (
                  type.name
                )}
              </td>
              <td className="border px-2 py-1">
                {editId === type.id ? (
                  <>
                    <button className="text-green-600 mr-2" onClick={() => handleUpdate(type.id)}>Lưu</button>
                    <button className="text-gray-500" onClick={() => setEditId(null)}>Hủy</button>
                  </>
                ) : (
                  <>
                    <button className="text-blue-600 mr-2" onClick={() => handleEdit(type.id, type.name)}>Sửa</button>
                    <button className="text-red-600" onClick={() => handleDelete(type.id)}>Xóa</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminJobTypes;
