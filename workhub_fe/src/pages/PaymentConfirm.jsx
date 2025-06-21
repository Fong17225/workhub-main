import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function PaymentConfirm() {
  const [params] = useSearchParams();
  const [confirmed, setConfirmed] = useState(false);
  const navigate = useNavigate();
  const pkgId = params.get('pkgId');

  useEffect(() => {
    if (pkgId) {
      // Gửi tín hiệu xác nhận về window opener (trang payment)
      if (window.opener) {
        window.opener.postMessage({ type: 'PAYMENT_CONFIRMED', pkgId }, '*');
      }
      setConfirmed(true);
      setTimeout(() => navigate('/', { replace: true }), 2000);
    }
  }, [pkgId, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Xác nhận thanh toán</h2>
        {confirmed ? (
          <div className="text-green-700 font-bold">Thanh toán thành công! Bạn có thể quay lại trang web trên máy tính.</div>
        ) : (
          <div className="text-gray-600">Đang xác nhận thanh toán...</div>
        )}
      </div>
    </div>
  );
}
