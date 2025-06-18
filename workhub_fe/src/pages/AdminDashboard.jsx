import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';

const AdminDashboard = () => {
  const token = localStorage.getItem('token');
  const { data: candidates, isLoading } = useQuery({
    queryKey: ['admin-candidates'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:8080/workhub/api/v1/admin/candidates', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.data;
    },
    enabled: !!token,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const { data: resumes } = useQuery({
    queryKey: ['admin-user-resumes', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return [];
      const res = await axios.get(`http://localhost:8080/workhub/api/v1/resumes/user/${selectedUser.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.data;
    },
    enabled: !!selectedUser?.id,
  });
  const { data: savedJobs } = useQuery({
    queryKey: ['admin-user-saved-jobs', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return [];
      const res = await axios.get(`http://localhost:8080/workhub/api/v1/saved-jobs/user/${selectedUser.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.data;
    },
    enabled: !!selectedUser?.id,
  });
  const { data: applications } = useQuery({
    queryKey: ['admin-user-applications', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return [];
      const res = await axios.get(`http://localhost:8080/workhub/api/v1/applications/user/${selectedUser.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.data;
    },
    enabled: !!selectedUser?.id,
  });
  const queryClient = useQueryClient();
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      const res = await axios.delete(`http://localhost:8080/workhub/api/v1/user/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.data;
    },
    onSuccess: () => {
      setSelectedUser(null);
      queryClient.invalidateQueries(['admin-candidates']);
      alert('Xóa ứng viên thành công!');
    },
    onError: () => {
      alert('Xóa ứng viên thất bại!');
    }
  });

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard Quản lý Ứng viên (Admin)</h1>
      {isLoading ? (
        <div>Đang tải...</div>
      ) : candidates?.length > 0 ? (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">ID</th>
              <th className="p-2">Tên</th>
              <th className="p-2">Email</th>
              <th className="p-2">Số điện thoại</th>
              <th className="p-2">Trạng thái</th>
              <th className="p-2">Ngày tạo</th>
              <th className="p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map(user => (
              <tr key={user.id} className="border-t">
                <td className="p-2">{user.id}</td>
                <td className="p-2">{user.fullname}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">{user.phone || '-'}</td>
                <td className="p-2">{user.status}</td>
                <td className="p-2">{user.createdAt ? new Date(user.createdAt).toLocaleString('vi-VN') : ''}</td>
                <td className="p-2">
                  <button
                    className="bg-primary text-white px-3 py-1 rounded text-xs"
                    onClick={() => setSelectedUser(user)}
                  >
                    Xem
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded text-xs ml-2"
                    onClick={() => {
                      if(window.confirm('Bạn có chắc muốn xóa ứng viên này?')) deleteUserMutation.mutate(user.id);
                    }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>Không có ứng viên nào.</div>
      )}
      {selectedUser && (
        <div className="mt-8 bg-white rounded shadow p-6">
          <h2 className="text-lg font-bold mb-4">Thông tin chi tiết ứng viên: {selectedUser.fullname}</h2>
          <h3 className="font-semibold mt-4 mb-2">CV đã tải lên</h3>
          <ul className="list-disc ml-6 mb-4">
            {resumes?.length > 0 ? resumes.map(r => (
              <li key={r.id}>
                <a href={`http://localhost:8080/workhub/api/v1/resumes/${r.id}/download`} target="_blank" rel="noopener noreferrer" className="text-primary underline">{r.title}</a>
              </li>
            )) : <li>Không có CV nào.</li>}
          </ul>
          <h3 className="font-semibold mt-4 mb-2">Công việc đã lưu</h3>
          <ul className="list-disc ml-6 mb-4">
            {savedJobs?.length > 0 ? savedJobs.map(j => (
              <li key={j.id}>{j.title}</li>
            )) : <li>Không có job đã lưu.</li>}
          </ul>
          <h3 className="font-semibold mt-4 mb-2">Lịch sử ứng tuyển</h3>
          <ul className="list-disc ml-6">
            {applications?.length > 0 ? applications.map(a => (
              <li key={a.applicationId}>{a.job?.title} ({a.status})</li>
            )) : <li>Không có lịch sử ứng tuyển.</li>}
          </ul>
          <button className="mt-4 px-4 py-2 bg-gray-200 rounded" onClick={() => setSelectedUser(null)}>Đóng</button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
