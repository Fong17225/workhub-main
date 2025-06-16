import { Link, useNavigate } from 'react-router-dom';
import { Search, Work, Business, School } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  BriefcaseIcon, 
  BuildingOfficeIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: allJobs, isLoading, isError } = useQuery({
    queryKey: ['allJobs'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:8080/workhub/api/v1/jobs');
      // Shuffle and take the first 5 jobs
      return response.data.sort(() => 0.5 - Math.random()).slice(0, 3);
    },
  });

  const featuredJobs = allJobs; // Rename for clarity in JSX

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchQuery.trim() !== '') {
        navigate(`/jobs?title=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  if (isError) {
    return <div className="text-center text-red-500">Lỗi khi tải dữ liệu việc làm.</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Tìm việc làm mơ ước của bạn
            </h1>
            <p className="text-xl mb-8">
              Hàng nghìn cơ hội việc làm đang chờ đón bạn
            </p>
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center bg-white rounded-lg p-2">
                <Search className="text-gray-400 ml-2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm việc làm, kỹ năng, công ty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearch}
                  className="flex-1 px-4 py-2 focus:outline-none text-gray-900"
                />
                <button 
                  onClick={handleSearch}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Work className="text-primary text-4xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Tìm việc làm phù hợp</h3>
              <p className="text-gray-600">
                Khám phá hàng nghìn cơ hội việc làm từ các công ty hàng đầu
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Business className="text-primary text-4xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Kết nối với nhà tuyển dụng</h3>
              <p className="text-gray-600">
                Tương tác trực tiếp với các nhà tuyển dụng uy tín
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <School className="text-primary text-4xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Phát triển sự nghiệp</h3>
              <p className="text-gray-600">
                Cập nhật kỹ năng và kiến thức mới nhất từ các chuyên gia
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8">Việc làm nổi bật</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredJobs?.map((job) => (
                <div key={job.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        <Link to={`/jobs/${job.id}`} className="hover:text-primary">
                          {job.title}
                        </Link>
                      </h3>
                      {/* <div className="mt-2 flex items-center text-sm text-gray-500">
                        <BuildingOfficeIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        {job.recruiter?.companyName}
                      </div> */}
                    </div>
                    {/* Check if job.postAt is 'urgent' and display badge */}
                    {job.postAt === 'urgent' && (
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Khẩn cấp
                      </span>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPinIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <CurrencyDollarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      {job.salaryRange}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      {job.type?.name}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <TagIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <span className="font-medium">Ngành nghề:</span>
                      <span className="ml-2">{job.category?.name}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <div>
                        <div>Đăng: {new Date(job.createdAt).toLocaleDateString('vi-VN')}</div>
                        {job.deadline && (
                          <div>Hạn nộp: {new Date(job.deadline).toLocaleDateString('vi-VN')}</div>
                        )}
                      </div>
                    </div>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link
              to="/jobs"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
            >
              Xem tất cả việc làm
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Sẵn sàng tìm việc làm mơ ước?
          </h2>
          <p className="text-xl mb-8">
            Tạo tài khoản ngay hôm nay và bắt đầu hành trình tìm kiếm việc làm
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Đăng ký miễn phí
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home; 