import React, { useEffect, useState } from 'react';
import { getJobCategories, createJobCategory, updateJobCategory, deleteJobCategory } from '../../apiService';

const AdminJobCategories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await getJobCategories();
    setCategories(res.data);
  };

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    await createJobCategory({ name: newCategory });
    setNewCategory('');
    fetchCategories();
  };

  const handleEdit = (id, name) => {
    setEditId(id);
    setEditValue(name);
  };

  const handleUpdate = async (id) => {
    await updateJobCategory(id, { name: editValue });
    setEditId(null);
    setEditValue('');
    fetchCategories();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa?')) {
      await deleteJobCategory(id);
      fetchCategories();
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Quản lý Danh Mục Công Việc</h2>
      <div className="flex mb-4">
        <input
          className="border px-2 py-1 flex-1 rounded-l"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          placeholder="Tên danh mục mới"
        />
        <button className="bg-primary text-white px-4 py-1 rounded-r" onClick={handleAdd}>Thêm</button>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Tên danh mục</th>
            <th className="border px-2 py-1">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.id}>
              <td className="border px-2 py-1">{cat.id}</td>
              <td className="border px-2 py-1">
                {editId === cat.id ? (
                  <input
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    className="border px-2 py-1"
                  />
                ) : (
                  cat.name
                )}
              </td>
              <td className="border px-2 py-1">
                {editId === cat.id ? (
                  <>
                    <button className="text-green-600 mr-2" onClick={() => handleUpdate(cat.id)}>Lưu</button>
                    <button className="text-gray-500" onClick={() => setEditId(null)}>Hủy</button>
                  </>
                ) : (
                  <>
                    <button className="text-blue-600 mr-2" onClick={() => handleEdit(cat.id, cat.name)}>Sửa</button>
                    <button className="text-red-600" onClick={() => handleDelete(cat.id)}>Xóa</button>
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

export default AdminJobCategories;
