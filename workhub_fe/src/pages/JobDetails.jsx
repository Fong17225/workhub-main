import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      // Lấy user từ token, không gọi API /me
      const token = localStorage.getItem('token');
      if (!token) return null;
      try {
        return JSON.parse(atob(token.split('.')[1]));
      } catch {
        return null;
      }
    },
    staleTime: Infinity,
  });

  // Query để lấy danh sách CV của user
  const { data: resumes, isLoading: isLoadingResumes } = useQuery({
    queryKey: ['resumes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/workhub/api/v1/resumes/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    },
    enabled: !!user?.id,
  });

  // Lấy danh sách slot phỏng vấn còn trống theo job
  const { data: slots, isLoading: isLoadingSlots } = useQuery({
    queryKey: ['slots', id],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8080/workhub/api/v1/interview-slots/by-job/${id}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      return res.data.filter(slot => !slot.booked);
    },
    enabled: showApplyModal && !!id,
  });

  // Mutation để nộp CV
  const applyJobMutation = useMutation({
    mutationFn: async ({ jobId, resumeId }) => {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:8080/workhub/api/v1/applications/${jobId}`, null, {
        params: { resumeId },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    },
    onSuccess: () => {
      setShowApplyModal(false);
      alert('Nộp CV thành công!');
    },
    onError: (error) => {
      console.error('Error applying job:', error);
      alert('Có lỗi xảy ra khi nộp CV. Vui lòng thử lại sau.');
    },
  });

  // Mutation để nộp CV và chọn slot
  const applyJobWithSlotMutation = useMutation({
    mutationFn: async ({ jobId, resumeId, slotId }) => {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:8080/workhub/api/v1/applications/${jobId}/with-slot`, null, {
        params: { resumeId, slotId },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    },
    onSuccess: () => {
      setShowApplyModal(false);
      alert('Nộp CV thành công!');
    },
    onError: (error) => {
      alert('Có lỗi xảy ra khi nộp CV hoặc chọn slot.');
    },
  });

  const { data: job, isLoading, isError } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/workhub/api/v1/jobs/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    },
    enabled: !!id,
  });

  const { data: savedJobs, isLoading: isLoadingSaved, isError: isErrorSaved } = useQuery({
    queryKey: ['savedJobs'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/workhub/api/v1/saved-jobs', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    },
    enabled: !!user,
  });

  const saveJobMutation = useMutation({
    mutationFn: async (jobId) => {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/workhub/api/v1/saved-jobs', null, {
        params: { jobId: jobId },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['savedJobs']);
    },
    onError: (error) => {
      console.error('Error saving job:', error);
      alert('Có lỗi xảy ra khi lưu việc làm.');
    },
  });

  const unsaveJobMutation = useMutation({
    mutationFn: async (jobId) => {
      const token = localStorage.getItem('token');
      const response = await axios.delete('http://localhost:8080/workhub/api/v1/saved-jobs', {
        params: { jobId: jobId },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['savedJobs']);
    },
    onError: (error) => {
      console.error('Error unsaving job:', error);
      alert('Có lỗi xảy ra khi bỏ lưu việc làm.');
    },
  });

  // Sửa lại hàm kiểm tra job đã lưu
  const isJobSaved = savedJobs?.some(savedJob => {
    // savedJob có thể là object có job hoặc jobId tuỳ backend
    if (savedJob.job) {
      return savedJob.job.id === parseInt(id);
    }
    return savedJob.jobId === parseInt(id);
  });

  const handleSaveUnsaveClick = () => {
    if (!user) {
      alert('Vui lòng đăng nhập để lưu việc làm.');
      navigate('/login');
      return;
    }

    if (isJobSaved) {
      unsaveJobMutation.mutate(parseInt(id));
    } else {
      saveJobMutation.mutate(parseInt(id));
    }
  };

  const handleApplyClick = () => {
    if (!user) {
      alert('Vui lòng đăng nhập để nộp CV.');
      navigate('/login');
      return;
    }

    if (!resumes || resumes.length === 0) {
      alert('Bạn chưa có CV nào. Vui lòng tạo CV trước khi nộp.');
      navigate('/profile');
      return;
    }

    setShowApplyModal(true);
  };

  // Sửa lại handleSubmitApplication để gửi kèm slotId
  const handleSubmitApplication = () => {
    if (!selectedResumeId) {
      alert('Vui lòng chọn một CV để nộp.');
      return;
    }
    if (!selectedSlotId) {
      alert('Vui lòng chọn một khung giờ phỏng vấn.');
      return;
    }
    applyJobWithSlotMutation.mutate({
      jobId: parseInt(id),
      resumeId: selectedResumeId,
      slotId: selectedSlotId,
    });
  };

  const { data: similarJobs, isLoading: isLoadingSimilar, isError: isErrorSimilar } = useQuery({
    queryKey: ['similarJobs', job?.category?.id, job?.skills?.map(s => s.id)],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (job?.category?.id) {
        params.append('categoryId', job.category.id);
      }
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/workhub/api/v1/jobs?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data.filter(similarJob => similarJob.id !== job.id).slice(0, 5);
    },
    enabled: !!job,
  });

  if (isLoading) {
    return <div className="text-center py-8">Đang tải chi tiết việc làm...</div>;
  }

  if (isError) {
    return <div className="text-center text-red-500 py-8">Không thể tải chi tiết việc làm. Vui lòng thử lại sau.</div>;
  }

  if (!job) {
    return <div className="text-center py-8">Không tìm thấy thông tin việc làm.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <img
                    src={job.recruiter?.company?.logoUrl || "https://via.placeholder.com/80"}
                    alt={job.recruiter?.companyName || "Company Logo"}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="ml-4">
                    <h1 className="text-2xl font-bold">{job.title}</h1>
                    <p className="text-gray-600 text-lg">{job.recruiter?.companyName}</p>
                    <div className="flex items-center text-gray-500 mt-2">
                      <span className="text-sm mr-4">Địa điểm: {job.location}</span>
                      <span className="text-sm">Loại công việc: {job.type?.name}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {!isLoading && user && (
                    <button
                      onClick={handleSaveUnsaveClick}
                      className={`text-gray-600 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed border px-4 py-2 rounded-lg ${isJobSaved ? 'bg-primary/10 text-primary border-primary' : ''}`}
                      aria-label={isJobSaved ? 'Bỏ lưu việc làm' : 'Lưu việc làm'}
                      disabled={saveJobMutation.isLoading || unsaveJobMutation.isLoading}
                    >
                      {saveJobMutation.isLoading || unsaveJobMutation.isLoading ? (
                        'Đang xử lý...'
                      ) : isJobSaved ? (
                        'Bỏ lưu việc làm'
                      ) : (
                        'Lưu việc làm'
                      )}
                    </button>
                  )}
                  <button className="text-gray-600 hover:text-primary" aria-label="Chia sẻ việc làm">
                    Chia sẻ
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center text-gray-600">
                  <span>Mức lương: {job.salaryRange}</span>
                </div>
                {job.experience !== undefined && job.experience !== null && (
                  <div className="flex items-center text-gray-600">
                    <span>Kinh nghiệm: {job.experience}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <span>Đăng: {new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                {job.deadline && (
                  <div className="flex items-center text-gray-600">
                    <span>Hạn nộp: {new Date(job.deadline).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <span>Ngành nghề: {job.category?.name}</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleApplyClick}
                  className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 font-semibold"
                >
                  Ứng tuyển ngay
                </button>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Mô tả công việc</h2>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.description }}></div>
            </div>

            {/* Job Requirements */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Yêu cầu công việc</h2>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.requirements }}></div>
            </div>

            {/* Job Benefits */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Quyền lợi</h2>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.benefits }}></div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Company Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Thông tin công ty</h2>
              <div className="flex items-center mb-4">
                <img
                  src={job.recruiter?.company?.logoUrl || "https://via.placeholder.com/50"}
                  alt={job.recruiter?.companyName || "Company Logo"}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="ml-4">
                  <h3 className="font-semibold">{job.recruiter?.companyName}</h3>
                  <p className="text-gray-600">{job.recruiter?.company?.industry}</p>
                </div>
              </div>
              <div className="space-y-2 text-gray-600">
                {job.recruiter?.company?.numberOfEmployees && (
                  <p className="flex items-center">
                    <span>{job.recruiter.company.numberOfEmployees} nhân viên</span>
                  </p>
                )}
                <p className="flex items-center">
                  <span>Địa điểm: {job.recruiter?.company?.address || job.recruiter?.location}</span>
                </p>
              </div>
              {job.recruiter?.company?.id && (
                <Link
                  to={`/companies/${job.recruiter.company.id}`}
                  className="block text-center text-primary hover:text-primary/80 mt-4"
                >
                  Xem trang công ty →
                </Link>
              )}
            </div>

            {/* Similar Jobs */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Việc làm tương tự</h2>
              {isLoadingSimilar ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : isErrorSimilar ? (
                <div className="text-center text-red-500 text-sm">Không thể tải danh sách việc làm tương tự.</div>
              ) : similarJobs?.length > 0 ? (
                <div className="space-y-4">
                  {similarJobs.map((similarJob) => (
                    <div key={similarJob.id} className="border-b pb-4 last:border-b-0">
                      <Link to={`/jobs/${similarJob.id}`} className="block hover:bg-gray-50 p-2 rounded">
                        <h3 className="font-semibold text-gray-900">{similarJob.title}</h3>
                        <p className="text-gray-600 text-sm">{similarJob.recruiter?.companyName}</p>
                        <div className="flex items-center text-gray-500 mt-2">
                          <span className="text-sm">{similarJob.location}</span>
                          <span className="mx-2">•</span>
                          <span className="text-sm">{similarJob.salaryRange}</span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm">Không có việc làm tương tự.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal nộp CV */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Chọn CV để nộp</h2>
            {isLoadingResumes ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : resumes?.length > 0 ? (
              <div className="space-y-4">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className={`p-4 border rounded-lg cursor-pointer ${
                      selectedResumeId === resume.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedResumeId(resume.id)}
                  >
                    <h3 className="font-medium">{resume.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{resume.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Tạo ngày: {new Date(resume.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                Bạn chưa có CV nào. Vui lòng tạo CV trước khi nộp.
              </div>
            )}
            <h3 className="mt-6 mb-2 font-medium">Chọn khung giờ phỏng vấn</h3>
            {isLoadingSlots ? (
              <div>Đang tải khung giờ...</div>
            ) : slots?.length > 0 ? (
              <div className="space-y-2">
                {slots.map(slot => (
                  <div
                    key={slot.id}
                    className={`p-2 border rounded cursor-pointer ${selectedSlotId === slot.id ? 'border-primary bg-primary/10' : 'border-gray-200'}`}
                    onClick={() => setSelectedSlotId(slot.id)}
                  >
                    {slot.startTime ? new Date(slot.startTime).toLocaleString('vi-VN') : 'Chưa xác định'}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">Không còn khung giờ trống.</div>
            )}
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowApplyModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitApplication}
                disabled={!selectedResumeId || applyJobMutation.isLoading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applyJobMutation.isLoading ? 'Đang xử lý...' : 'Nộp CV'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;