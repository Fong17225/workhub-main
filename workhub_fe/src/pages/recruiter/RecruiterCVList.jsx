import React, { useEffect, useState } from 'react';
import { getApplicationsByUser } from '../../apiService';

export default function RecruiterCVList() {
  const [cvs, setCVs] = useState([]);
  const token = localStorage.getItem('token');
  const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  useEffect(() => {
    fetchCVs();
    // eslint-disable-next-line
  }, []);

  const fetchCVs = async () => {
    if (!userId) return;
    const res = await getApplicationsByUser(userId, config);
    setCVs(res.data);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Danh sách CV ứng viên đã ứng tuyển</h2>
      <ul>
        {cvs.map(cv => (
          <li key={cv.id} className="border-b py-2">
            <span className="font-bold">{cv.candidate?.fullname}</span> - {cv.candidate?.email} - <a className="text-blue-600 underline" href={cv.resumeUrl} target="_blank" rel="noopener noreferrer">Xem CV</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
