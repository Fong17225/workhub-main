import React, { useEffect, useState } from "react";
import { getInterviewSlotsByJob, getInterviewSessions, deleteInterviewSlot } from "../../apiService";
import { TrashIcon } from "@heroicons/react/24/outline";

const AdminInterviewSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobIds, setJobIds] = useState([]);

  useEffect(() => {
    setLoading(true);
    getInterviewSessions()
      .then((sessionsRes) => {
        const ids = Array.from(new Set((sessionsRes.data || []).map(s => s.job?.id).filter(Boolean)));
        setJobIds(ids);
        if (ids.length === 0) {
          setSlots([]);
          setLoading(false);
          return;
        }
        Promise.all(ids.map(id => getInterviewSlotsByJob(id)))
          .then((slotsArr) => {
            const allSlots = slotsArr.flatMap(res => res.data);
            setSlots(allSlots);
            setLoading(false);
          })
          .catch(() => {
            setError("Lỗi khi tải dữ liệu slot");
            setLoading(false);
          });
      })
      .catch(() => {
        setError("Lỗi khi tải dữ liệu phiên phỏng vấn");
        setLoading(false);
      });
  }, []);

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa slot này?")) return;
    try {
      await deleteInterviewSlot(slotId);
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
    } catch (err) {
      alert("Xóa slot thất bại!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-8">Quản lý Slot phỏng vấn</h1>
        {loading ? (
          <div className="text-center text-blue-500 py-8 text-lg">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8 text-lg">{error}</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-6 overflow-x-auto">
            <h2 className="text-xl font-bold mb-4 text-primary">Danh sách Slot</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-4 py-3 text-left font-bold text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Bắt đầu</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Đã đặt?</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Ứng viên</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-700">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {slots.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4 text-gray-400">Không có dữ liệu</td></tr>
                ) : (
                  slots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-blue-50 transition">
                      <td className="px-4 py-2">{slot.id}</td>
                      <td className="px-4 py-2">{slot.startTime ? new Date(slot.startTime).toLocaleString() : '-'}</td>
                      <td className="px-4 py-2">{slot.booked ? 'Đã đặt' : 'Chưa đặt'}</td>
                      <td className="px-4 py-2">{slot.candidateName || '-'}</td>
                      <td className="px-4 py-2 flex gap-2 justify-center">
                        <button className="p-2 rounded hover:bg-red-100" onClick={() => handleDeleteSlot(slot.id)} title="Xóa">
                          <TrashIcon className="w-5 h-5 text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInterviewSlots;
