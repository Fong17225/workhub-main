import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminJobs, getApplicationsByJobId, getResumeFileBase64, addUserToJob, deleteUserFromJob, getUsers, getResumesByUser } from '../../apiService';

export default function AdminApplications() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userList, setUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userResumes, setUserResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await getAdminJobs(config);
        setJobs(res.data);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          navigate('/login');
        }
      }
      setLoading(false);
    };
    fetchJobs();
  }, [navigate]);

  const handleSelectJob = async (jobId) => {
    setSelectedJob(jobId);
    setLoading(true);
    try {
      const res = await getApplicationsByJobId(jobId, config);
      setApplications(res.data);
    } catch {
      setApplications([]);
    }
    setLoading(false);
  };

  // Xem CV dạng PDF
  const handleViewResume = async (resumeId, resumeTitle) => {
    try {
      const token = localStorage.getItem('token');
      const response = await getResumeFileBase64(resumeId, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const base64 = response.data;
      const pdfWindow = window.open('');
      pdfWindow.document.write(
        `<title>${resumeTitle || 'CV'}</title><iframe width='100%' height='100%' src='data:application/pdf;base64,${base64}'></iframe>`
      );
    } catch (error) {
      alert('Đã xảy ra lỗi khi xem CV.');
    }
  };

  // Tải về CV
  const handleDownloadResume = async (resumeId, resumeTitle) => {
    try {
      const token = localStorage.getItem('token');
      const response = await getResumeFileBase64(resumeId, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const base64 = response.data;
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${base64}`;
      link.download = `${resumeTitle || 'CV'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert('Đã xảy ra lỗi khi tải về CV.');
    }
  };

  // Lấy danh sách user khi mở modal thêm
  const handleOpenAddModal = async () => {
    setShowAddModal(true);
    try {
      const res = await getUsers(config);
      setUserList(res.data);
    } catch {}
  };
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setSelectedUser(null);
    setUserResumes([]);
    setSelectedResume(null);
  };
  // Khi chọn user, lấy danh sách CV
  const handleSelectUser = async (userId) => {
    setSelectedUser(userId);
    try {
      const res = await getResumesByUser(userId, config);
      setUserResumes(res.data);
    } catch {
      setUserResumes([]);
    }
  };
  // Thêm ứng viên vào job
  const handleAddUserToJob = async () => {
    if (!selectedUser || !selectedResume) return;
    try {
      await addUserToJob(selectedJob, selectedUser, selectedResume, config);
      handleCloseAddModal();
      handleSelectJob(selectedJob); // reload danh sách
    } catch (e) {
      alert('Thêm ứng viên thất bại!');
    }
  };
  // Xóa ứng viên khỏi job
  const handleDeleteUserFromJob = async (applicationId) => {
    if (!window.confirm('Bạn có chắc muốn xóa ứng viên này khỏi job?')) return;
    try {
      await deleteUserFromJob(selectedJob, applicationId, config);
      handleSelectJob(selectedJob);
    } catch (e) {
      alert('Xóa thất bại!');
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Quản lý ứng tuyển</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {jobs.map(job => (
          <div
            key={job.id}
            className={`p-4 rounded shadow cursor-pointer border ${selectedJob === job.id ? 'border-blue-500 bg-blue-50' : 'bg-white'}`}
            onClick={() => handleSelectJob(job.id)}
          >
            <div className="font-semibold text-blue-700">{job.title}</div>
            <div className="text-gray-500 text-sm">{job.companyName || job.company?.name}</div>
            <div className="text-gray-400 text-xs">ID: {job.id}</div>
          </div>
        ))}
      </div>
      {selectedJob && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-blue-700">Danh sách ứng viên ứng tuyển</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleOpenAddModal}>Thêm ứng viên</button>
          </div>
          {loading ? 'Đang tải...' : (
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">Tên ứng viên</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">CV</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 && (
                  <tr><td colSpan={3} className="text-center text-gray-400">Chưa có ứng viên ứng tuyển</td></tr>
                )}
                {applications.map((app, idx) => (
                  <tr key={app.id || app.resumeId || idx} className="border-t">
                    <td className="p-2">{app.userFullname || app.candidateName || '-'}</td>
                    <td className="p-2">{app.userEmail || app.candidateEmail || '-'}</td>
                    <td className="p-2">
                      {app.resumeId ? (
                        <>
                          <button className="text-blue-600 underline mr-2" onClick={() => handleViewResume(app.resumeId, app.userFullname || app.candidateName)}>Xem CV</button>
                          <button className="text-green-600 underline mr-2" onClick={() => handleDownloadResume(app.resumeId, app.userFullname || app.candidateName)}>Tải về</button>
                          <button className="text-red-600 underline" onClick={() => handleDeleteUserFromJob(app.id)}>Xóa</button>
                        </>
                      ) : 'Không có'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal thêm ứng viên */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-bold mb-4">Thêm ứng viên vào job</h4>
            <div className="mb-4">
              <label className="block mb-1">Chọn ứng viên:</label>
              <select className="w-full border p-2 rounded" value={selectedUser || ''} onChange={e => { handleSelectUser(e.target.value); setSelectedResume(''); }}>
                <option value="">-- Chọn ứng viên --</option>
                {userList.map(u => (
                  <option key={u.id} value={u.id}>{u.fullname} ({u.email})</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-1">Chọn CV:</label>
              <select className="w-full border p-2 rounded" value={selectedResume || ''} onChange={e => setSelectedResume(e.target.value)} disabled={!userResumes.length}>
                <option value="">-- Chọn CV --</option>
                {userResumes.map(r => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
              {!userResumes.length && selectedUser && <div className="text-red-500 text-sm mt-1">Ứng viên này chưa có CV nào.</div>}
            </div>
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={handleCloseAddModal}>Hủy</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleAddUserToJob} disabled={!selectedUser || !selectedResume}>Thêm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
