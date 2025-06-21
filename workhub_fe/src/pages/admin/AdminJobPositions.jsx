import React, { useEffect, useState } from 'react';
import { getJobPositions, createJobPosition, updateJobPosition, deleteJobPosition } from '../../apiService';

const AdminJobPositions = () => {
  const [positions, setPositions] = useState([]);
  const [newPosition, setNewPosition] = useState('');
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    const res = await getJobPositions();
    setPositions(res.data);
  };

  const handleAdd = async () => {
    if (!newPosition.trim()) return;
    await createJobPosition({ name: newPosition });
    setNewPosition('');
    fetchPositions();
  };

  const handleEdit = (id, name) => {
    setEditId(id);
    setEditValue(name);
  };

  const handleUpdate = async (id) => {
    await updateJobPosition(id, { name: editValue });
    setEditId(null);
    setEditValue('');
    fetchPositions();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa?')) {
      await deleteJobPosition(id);
      fetchPositions();
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Quản lý Vị Trí Công Việc</h2>
      <div className="flex mb-4">
        <input
          className="border px-2 py-1 flex-1 rounded-l"
          value={newPosition}
          onChange={e => setNewPosition(e.target.value)}
          placeholder="Tên vị trí mới"
        />
        <button className="bg-primary text-white px-4 py-1 rounded-r" onClick={handleAdd}>Thêm</button>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Tên vị trí</th>
            <th className="border px-2 py-1">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {positions.map(pos => (
            <tr key={pos.id}>
              <td className="border px-2 py-1">{pos.id}</td>
              <td className="border px-2 py-1">
                {editId === pos.id ? (
                  <input
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    className="border px-2 py-1"
                  />
                ) : (
                  pos.name
                )}
              </td>
              <td className="border px-2 py-1">
                {editId === pos.id ? (
                  <>
                    <button className="text-green-600 mr-2" onClick={() => handleUpdate(pos.id)}>Lưu</button>
                    <button className="text-gray-500" onClick={() => setEditId(null)}>Hủy</button>
                  </>
                ) : (
                  <>
                    <button className="text-blue-600 mr-2" onClick={() => handleEdit(pos.id, pos.name)}>Sửa</button>
                    <button className="text-red-600" onClick={() => handleDelete(pos.id)}>Xóa</button>
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

export default AdminJobPositions;
