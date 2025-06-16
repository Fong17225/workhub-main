import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import {
  Edit,
  LocationOn,
  Work,
  School,
  Email,
  Phone,
  LinkedIn,
  GitHub,
  Bookmark,
  History,
  Settings,
} from '@mui/icons-material';
import PersonIcon from '@mui/icons-material/Person';
import ArticleIcon from '@mui/icons-material/Article';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [newResumeContent, setNewResumeContent] = useState('');
  const [newResumeFile, setNewResumeFile] = useState(null);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:8080/workhub/api/v1/me', {
        withCredentials: true
      });
      return response.data;
    },
    staleTime: Infinity,
  });

  const { data: savedJobs, isLoading: isLoadingSaved, isError: isErrorSaved } = useQuery({
    queryKey: ['savedJobs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await axios.get(`http://localhost:8080/workhub/api/v1/saved-jobs?userId=${user.id}`);
      return response.data;
    },
    enabled: !!user?.id,
  });

  // Query để lấy danh sách công việc đã ứng tuyển
  const { data: appliedJobs, isLoading: isLoadingApplied } = useQuery({
    queryKey: ['appliedJobs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await axios.get(`http://localhost:8080/workhub/api/v1/applications/users/${user.id}`);
      return response.data;
    },
    enabled: !!user?.id,
  });

  // Query để lấy danh sách CV của người dùng
  const { data: resumes, isLoading: isLoadingResumes, refetch: refetchResumes } = useQuery({
    queryKey: ['userResumes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await axios.get(`http://localhost:8080/workhub/api/v1/resumes/${user.id}`);
      return response.data;
    },
    enabled: !!user?.id,
  });

  // Mutation để tải lên CV mới
  const createResumeMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await axios.post(`http://localhost:8080/workhub/api/v1/resumes/${user.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      // Refetch resumes after successful upload
      refetchResumes();
      // Clear form fields
      setNewResumeTitle('');
      setNewResumeContent('');
      setNewResumeFile(null);
      setSelectedSkillIds([]); // Clear selected skills
      alert('CV đã được tải lên thành công!');
    },
    onError: (error) => {
      console.error('Lỗi tải lên CV:', error);
      alert('Đã xảy ra lỗi khi tải lên CV.');
    },
  });

  // Mutation để xóa CV
  const deleteResumeMutation = useMutation({
    mutationFn: async (resumeId) => {
      const response = await axios.delete(`http://localhost:8080/workhub/api/v1/resumes/${user.id}/${resumeId}`, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      // Refetch resumes after successful deletion
      refetchResumes();
      alert('CV đã được xóa thành công!');
    },
    onError: (error) => {
      console.error('Lỗi xóa CV:', error);
      alert('Đã xảy ra lỗi khi xóa CV.');
    },
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="md:col-span-3">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Hàm để hiển thị trạng thái ứng tuyển với màu sắc tương ứng
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Đang chờ duyệt' },
      accepted: { color: 'bg-green-100 text-green-800', text: 'Đã chấp nhận' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Đã từ chối' },
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // Hàm xử lý tải lên CV mới
  const handleResumeUpload = async (event) => {
    event.preventDefault();

    if (!user?.id) {
      alert('Vui lòng đăng nhập để tải lên CV.');
      return;
    }

    if (!newResumeFile) {
      alert('Vui lòng chọn file CV để tải lên.');
      return;
    }

    const formData = new FormData();
    formData.append('file', newResumeFile);
    formData.append('title', newResumeTitle || 'CV không tiêu đề'); // Use a default title if empty
    formData.append('content', newResumeContent || '');

    // Handle skillIds
    if (selectedSkillIds.length > 0) {
       selectedSkillIds.forEach(skillId => formData.append('skillIds', skillId.toString()));
    } else {
       // If no skills selected, explicitly send an empty parameter
       formData.append('skillIds', '');
    }

    // Log FormData contents (for debugging, not sent in production)
    // for (let pair of formData.entries()) {
    //     console.log(pair[0]+ ': ' + pair[1]);
    // }


    createResumeMutation.mutate(formData);
  };

  // Hàm xử lý xóa CV
  const handleDeleteResume = (resumeId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa CV này không?')) {
      deleteResumeMutation.mutate(resumeId);
    }
  };

  // Hàm xử lý tải về CV (sẽ implement sau)
  const handleDownloadResume = async (resumeId, resumeTitle) => {
    // alert('Chức năng tải về đang được phát triển.');
    // Implementation for download will go here
    try {
      const response = await axios.get(`http://localhost:8080/workhub/api/v1/applications/resumes/${resumeId}/download`, {
        responseType: 'blob', // Important for downloading files
        withCredentials: true,
      });

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: response.headers['content-type'] });

      // Create a link element
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      // Extract file extension from content-type
      const fileExtension = response.headers['content-type'] ? response.headers['content-type'].split('/')[1] : 'pdf';
      link.download = `${resumeTitle || 'CV'}.${fileExtension}`; // Set filename with dynamic extension

      // Append to the body and click the link to trigger download
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);

    } catch (error) {
      console.error('Lỗi tải về CV:', error);
      alert('Đã xảy ra lỗi khi tải về CV.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
              <PersonIcon className="h-16 w-16 text-gray-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-gray-600">{user.phone}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <nav className="p-4">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    activeTab === 'profile'
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <PersonIcon />
                  <span>Hồ sơ</span>
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    activeTab === 'saved'
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Bookmark />
                  <span>Việc làm đã lưu ({isLoadingSaved ? '...' : savedJobs?.length || 0})</span>
                </button>
                <button
                  onClick={() => setActiveTab('resumes')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    activeTab === 'resumes'
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ArticleIcon />
                  <span>Quản lý CV ({isLoadingResumes ? '...' : resumes?.length || 0})</span>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    activeTab === 'history'
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <History />
                  <span>Lịch sử ứng tuyển ({isLoadingApplied ? '...' : appliedJobs?.length || 0})</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    activeTab === 'settings'
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings />
                  <span>Cài đặt</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Thông tin cá nhân</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Thông tin cơ bản</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                        <p className="mt-1 text-gray-900">{user.fullName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-gray-900">{user.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                        <p className="mt-1 text-gray-900">{user.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                        <p className="mt-1 text-gray-900">{user.address}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Kỹ năng</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.skills?.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Học vấn</h3>
                    <div className="space-y-4">
                      {user.education?.map((edu, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <School />
                          <div>
                            <h4 className="font-medium">{edu.school}</h4>
                            <p className="text-gray-600">{edu.degree}</p>
                            <p className="text-sm text-gray-500">
                              {edu.startDate} - {edu.endDate}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Kinh nghiệm làm việc</h3>
                    <div className="space-y-4">
                      {user.experience?.map((exp, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <Work />
                          <div>
                            <h4 className="font-medium">{exp.company}</h4>
                            <p className="text-gray-600">{exp.position}</p>
                            <p className="text-sm text-gray-500">
                              {exp.startDate} - {exp.endDate}
                            </p>
                            <p className="mt-2 text-gray-700">{exp.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Liên kết</h3>
                    <div className="space-y-2">
                      {user.socialLinks?.map((link, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {link.platform}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Việc làm đã lưu</h2>
                {isLoadingSaved ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : isErrorSaved ? (
                  <div className="text-center text-red-500 text-sm">Không thể tải danh sách việc làm đã lưu.</div>
                ) : savedJobs?.length > 0 ? (
                  <div className="space-y-4">
                    {savedJobs.map((savedJob) => (
                      <div key={savedJob.id} className="border-b pb-4 last:border-b-0">
                        <h3 className="font-semibold">
                          <Link to={`/jobs/${savedJob.jobId}`} className="hover:text-primary">
                            {savedJob.jobTitle || '[Tiêu đề trống]'}
                          </Link>
                        </h3>
                        <p className="text-gray-600 text-sm">{savedJob.companyName || '[Công ty ẩn danh]'}</p>
                        <div className="flex items-center text-gray-500 mt-2">
                          <LocationOn className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <span>Địa điểm: {savedJob.location || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-gray-500 mt-2">
                          <span>Mức lương: {savedJob.salaryRange || 'Thương lượng'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                          <span>Đã lưu vào: {new Date(savedJob.savedAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 text-sm">Bạn chưa lưu việc làm nào.</div>
                )}
              </div>
            )}

            {activeTab === 'resumes' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Quản lý CV</h2>
                {isLoadingResumes ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : resumes?.length > 0 ? (
                  <div className="space-y-4">
                    {resumes.map(resume => (
                      <div key={resume.id} className="border-b pb-4 last:border-b-0">
                        <h3 className="font-semibold">{resume.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{resume.content}</p>
                        <p className="text-sm text-gray-500 mt-2">Tải lên vào: {new Date(resume.createdAt).toLocaleDateString('vi-VN')}</p>
                        <div className="mt-4 flex space-x-4">
                          <button
                            onClick={() => handleDownloadResume(resume.id, resume.title)}
                            className="text-primary hover:underline text-sm"
                          >
                            Tải về
                          </button>
                          <button
                            onClick={() => handleDeleteResume(resume.id)}
                            className="text-red-600 hover:underline text-sm"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 text-sm">Bạn chưa có CV nào. Hãy tải lên CV đầu tiên của bạn!</div>
                )}

                {/* Form to upload new CV */}
                <div className="mt-8 border-t pt-8">
                  <h3 className="text-lg font-semibold mb-4">Tải lên CV mới</h3>
                  <form onSubmit={handleResumeUpload} className="space-y-4">
                    <div>
                      <label htmlFor="resumeTitle" className="block text-sm font-medium text-gray-700">Tiêu đề CV</label>
                      <input
                        type="text"
                        id="resumeTitle"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                        value={newResumeTitle}
                        onChange={(e) => setNewResumeTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="resumeContent" className="block text-sm font-medium text-gray-700">Mô tả (Tùy chọn)</label>
                      <textarea
                        id="resumeContent"
                        rows="3"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                        value={newResumeContent}
                        onChange={(e) => setNewResumeContent(e.target.value)}
                      ></textarea>
                    </div>
                    <div>
                      <label htmlFor="resumeFile" className="block text-sm font-medium text-gray-700">Chọn File CV (PDF, DOC, DOCX)</label>
                      <input
                        type="file"
                        id="resumeFile"
                        accept=".pdf,.doc,.docx"
                        className="mt-1 block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary/10 file:text-primary
                          hover:file:bg-primary/20"
                        onChange={(e) => setNewResumeFile(e.target.files[0])}
                        required
                      />
                    </div>
                    {/* Skill selection will be added here later */}
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      disabled={createResumeMutation.isLoading}
                    >
                      {createResumeMutation.isLoading ? 'Đang tải lên...' : 'Tải lên CV'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Lịch sử ứng tuyển</h2>
                {isLoadingApplied ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : appliedJobs?.length > 0 ? (
                  <div className="space-y-4">
                    {appliedJobs.map((application) => (
                      <div key={application.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">
                              <Link to={`/jobs/${application.jobId}`} className="hover:text-primary">
                                {application.jobTitle}
                              </Link>
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">{application.companyName}</p>
                            <div className="flex items-center text-gray-500 mt-2">
                              <LocationOn className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                              <span>Địa điểm: {application.location}</span>
                            </div>
                            <div className="flex items-center text-gray-500 mt-2">
                              <span>Mức lương: {application.salaryRange}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            {getStatusBadge(application.status)}
                            <p className="text-sm text-gray-500 mt-2">
                              Nộp vào: {new Date(application.appliedAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700">CV đã nộp:</h4>
                          <p className="text-sm text-gray-600 mt-1">{application.resumeTitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 text-sm">Bạn chưa ứng tuyển việc làm nào.</div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Cài đặt</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Thông báo</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email thông báo</p>
                          <p className="text-sm text-gray-500">
                            Nhận thông báo qua email về việc làm mới
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Bảo mật</h3>
                    <div className="space-y-4">
                      <button className="text-red-600 hover:text-red-700">
                        Xóa tài khoản
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 