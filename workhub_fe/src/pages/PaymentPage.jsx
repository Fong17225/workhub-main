import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { buyServicePackage } from '../apiService';

const paymentMethods = [
  { value: 'momo', label: 'Ví MoMo', qr: 'https://img.vietqr.io/image/970422-123456789-compact2.png?amount=AMOUNT&addInfo=MoMo+Payment' },
  { value: 'vnpay', label: 'VNPAY', qr: 'https://img.vietqr.io/image/970422-123456789-compact2.png?amount=AMOUNT&addInfo=VNPAY+Payment' },
  { value: 'banking', label: 'Chuyển khoản ngân hàng', qr: 'https://img.vietqr.io/image/970422-123456789-compact2.png?amount=AMOUNT&addInfo=Banking+Payment' },
];

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  // Thêm prop: isUpgrade để xác định có phải nâng cấp không
  const { pkg, isUpgrade } = location.state || {};
  const [method, setMethod] = useState('momo');
  const [paid, setPaid] = useState(false);
  const [buying, setBuying] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!pkg) return <div className="p-8 text-center text-red-500">Không tìm thấy thông tin gói dịch vụ.</div>;

  // Tạo link xác nhận thanh toán động dựa trên gói và user
  const confirmUrl = `${window.location.origin}/payment-confirm?pkgId=${pkg.id}`;
  // QR sẽ chứa link xác nhận này
  const qrValue = confirmUrl;

  const afterPayment = () => {
    if (isUpgrade) {
      setSuccess(true);
      setTimeout(() => window.location.href = '/dashboard', 1200);
    } else {
      setSuccess(true);
      setTimeout(() => window.location.href = '/create-company', 1200);
    }
  };

  const handlePaid = async () => {
    setBuying(true);
    setTimeout(async () => {
      try {
        await buyServicePackage(JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id, pkg.id, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        afterPayment();
      } catch {
        alert('Kích hoạt gói thất bại!');
      }
      setBuying(false);
    }, 1200);
  };

  // Hàm này sẽ được gọi khi xác nhận thanh toán từ điện thoại (giả lập qua link)
  window.onPaymentConfirmed = async function () {
    setWaiting(true);
    try {
      await buyServicePackage(JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id, pkg.id, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      afterPayment();
    } catch {
      alert('Kích hoạt gói thất bại!');
    }
    setWaiting(false);
  };

  React.useEffect(() => {
    function handlePaymentMsg(e) {
      if (e.data && e.data.type === 'PAYMENT_CONFIRMED' && e.data.pkgId === String(pkg.id)) {
        setWaiting(true);
        buyServicePackage(JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id, pkg.id, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
          .then(() => afterPayment())
          .catch(() => alert('Kích hoạt gói thất bại!'))
          .finally(() => setWaiting(false));
      }
    }
    window.addEventListener('message', handlePaymentMsg);
    return () => window.removeEventListener('message', handlePaymentMsg);
  }, [pkg]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Thanh toán gói: {pkg.name}</h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Chọn phương thức thanh toán:</label>
          <select className="w-full border p-2 rounded" value={method} onChange={e => setMethod(e.target.value)}>
            {paymentMethods.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div className="mb-4 flex flex-col items-center">
          <div className="mb-2 font-medium">Quét mã QR để thanh toán {pkg.price.toLocaleString()} VNĐ</div>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=192x192&data=${encodeURIComponent(confirmUrl)}`} alt="QR code" className="w-48 h-48 border" />
          <div className="mt-2 text-xs text-gray-500 break-all">Hoặc truy cập: <span className="underline">{confirmUrl}</span></div>
          <button
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
            onClick={handlePaid}
            disabled={waiting || success}
          >
            Xác nhận thanh toán ngay trên máy tính
          </button>
        </div>
        <button
          className="w-full px-4 py-2 bg-green-600 text-white rounded mt-4"
          onClick={() => alert('Vui lòng xác nhận thanh toán trên điện thoại!')}
          disabled={waiting || success}
        >
          Tôi đã thanh toán xong
        </button>
        {waiting && (
          <div className="mt-4 text-blue-700 font-bold text-center">
            Đang xác nhận thanh toán...
          </div>
        )}
        {success && (
          <div className="mt-4 text-green-700 font-bold text-center">
            Thanh toán thành công! Đang kích hoạt gói...
          </div>
        )}
        <button
          className="w-full px-4 py-2 bg-gray-300 rounded mt-2"
          onClick={() => navigate(-1)}
        >
          Quay lại
        </button>
      </div>
    </div>
  );
}
