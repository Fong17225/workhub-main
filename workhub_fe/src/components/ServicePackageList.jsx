import React, { useEffect, useState } from 'react';
import { getServicePackages, buyServicePackage } from '../apiService';
import { getUserPackages } from '../api/getUserPackages';
import { useNavigate } from 'react-router-dom';

export default function ServicePackageList({ user }) {
  const [packages, setPackages] = useState([]);
  const [userPackages, setUserPackages] = useState([]);
  const [userPackageDetails, setUserPackageDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const res = await getServicePackages(config);
        setPackages(res.data);
        if (user?.id) {
          const upRes = await getUserPackages(user.id, config);
          setUserPackages(upRes.data.map(up => up.servicePackage?.id));
          setUserPackageDetails(upRes.data);
        }
      } catch {
        setPackages([]);
        setUserPackages([]);
      }
      setLoading(false);
    };
    fetchPackages();
  }, []);

  const handleBuy = (pkg) => {
    if (!token) {
      navigate('/login');
      return;
    }
    // Kiểm tra nếu user có gói thấp hơn còn hạn
    const now = new Date();
    const lowerActive = userPackageDetails.find(up => {
      const exp = up.expirationDate ? new Date(up.expirationDate) : null;
      return up.servicePackage && up.servicePackage.price < pkg.price && exp && exp > now;
    });
    if (lowerActive) {
      setSelectedPkg(pkg);
      setShowUpgrade(true);
      setMessage('Nếu bạn mua gói này, gói cũ (' + lowerActive.servicePackage.name + ') sẽ bị xóa.');
      return;
    }
    if (userPackages.includes(pkg.id)) {
      setSelectedPkg(pkg);
      setShowUpgrade(true);
      return;
    }
    navigate('/payment', { state: { pkg } });
  };

  return (
    <div className="my-8">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Các gói dịch vụ dành cho nhà tuyển dụng</h2>
      {loading ? 'Đang tải...' : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <div key={pkg.id} className="border rounded-xl shadow p-6 bg-white flex flex-col">
              <div className="font-bold text-lg text-blue-700 mb-2">{pkg.name}</div>
              <div className="text-gray-600 mb-2">{pkg.description}</div>
              <div className="text-green-700 font-bold mb-2">{pkg.price.toLocaleString()} VNĐ</div>
              <div className="text-gray-500 mb-2">Thời hạn: {pkg.duration} ngày</div>
              <div className="flex-1" />
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
                onClick={() => handleBuy(pkg)}
                disabled={userPackages.includes(pkg.id)}
              >
                {userPackages.includes(pkg.id)
                  ? 'Bạn đã sở hữu gói này'
                  : user && user.role === 'candidate'
                    ? 'Mua & trở thành nhà tuyển dụng'
                    : 'Mua gói này'}
              </button>
            </div>
          ))}
        </div>
      )}
      {message && <div className="mt-4 text-center text-green-600 font-bold">{message}</div>}
      {showUpgrade && selectedPkg && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-blue-700">{userPackages.includes(selectedPkg.id) ? 'Bạn đã sở hữu gói này' : 'Nâng cấp gói dịch vụ'}</h3>
            <div className="mb-4">
              {userPackages.includes(selectedPkg.id)
                ? <>Bạn đã mua gói <span className="font-bold text-green-700">{selectedPkg.name}</span>.<br/>Bạn muốn nâng cấp lên gói cao hơn?</>
                : message || 'Bạn muốn nâng cấp lên gói này?'}
            </div>
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => { setShowUpgrade(false); setMessage(''); }}>Đóng</button>
              {!userPackages.includes(selectedPkg.id) && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => { setShowUpgrade(false); setMessage(''); navigate('/payment', { state: { pkg: selectedPkg, isUpgrade: true } }); }}>Đồng ý nâng cấp</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
