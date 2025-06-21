import React from 'react';
import {
  Bar,
  Pie,
  Line,
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function AdminCharts() {
  // Demo data, replace with real API data
  const userData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Người dùng mới',
        data: [120, 190, 300, 250, 220, 310],
        backgroundColor: 'rgba(59,130,246,0.7)',
      },
    ],
  };
  const jobData = {
    labels: ['IT', 'Kế toán', 'Marketing', 'Xây dựng', 'Khác'],
    datasets: [
      {
        label: 'Số lượng job',
        data: [50, 30, 20, 10, 15],
        backgroundColor: [
          'rgba(59,130,246,0.7)',
          'rgba(16,185,129,0.7)',
          'rgba(251,191,36,0.7)',
          'rgba(239,68,68,0.7)',
          'rgba(107,114,128,0.7)',
        ],
      },
    ],
  };
  const lineData = {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
    datasets: [
      {
        label: 'Doanh thu (triệu VNĐ)',
        data: [10, 12, 15, 13, 17, 20],
        borderColor: 'rgba(59,130,246,1)',
        backgroundColor: 'rgba(59,130,246,0.2)',
        fill: true,
      },
    ],
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-bold mb-4 text-blue-700">Thống kê người dùng mới</h2>
        <Bar data={userData} />
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-bold mb-4 text-blue-700">Tỉ lệ job theo ngành</h2>
        <Pie data={jobData} />
      </div>
      <div className="bg-white rounded-xl shadow p-6 col-span-1 md:col-span-2">
        <h2 className="font-bold mb-4 text-blue-700">Doanh thu theo tháng</h2>
        <Line data={lineData} />
      </div>
    </div>
  );
}
