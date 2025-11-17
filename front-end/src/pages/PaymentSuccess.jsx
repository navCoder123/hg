import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentSuccess = () => {
  const { paymentId } = useParams(); // get ID from URL
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/payment/${paymentId}`);
        setPayment(res.data);
      } catch (err) {
        console.error("Payment fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId]);

  if (loading) return <div>Loading...</div>;
  if (!payment)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-4">
        <h2 className="text-xl font-semibold mb-4">No payment data found.</h2>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-all duration-300 hover:scale-105"
        >
          Go Home
        </button>
      </div>
    );

  const downloadQR = () => {
    if (!payment.qrDataUrl) return;
    const link = document.createElement("a");
    link.href = payment.qrDataUrl;
    link.download = "payment_qr.png";
    link.click();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white px-4">
      <div className="bg-gray-800/70 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl text-center max-w-sm sm:max-w-md w-full border border-gray-700 animate-fadeIn">
        <div className="text-green-400 mb-4 text-6xl font-bold">HALLA GHAR</div>

        <h2 className="text-3xl font-bold text-green-400 mb-4 animate-pulse">
           Payment Successful!
        </h2>

      <div className="text-gray-300 mb-4">
  <p>Payment ID: {payment.paymentId}</p>
  <p>Order ID: {payment.orderId}</p>
          <p>Amount Paid: ₹{payment.amount}</p>
          <p>Name: {payment.name || "N/A"}</p>
          <p>Email: {payment.email || "N/A"}</p>
</div>


        {payment.qrDataUrl && (
          <>
            <h3 className="font-semibold mb-3 text-green-300">Your QR Code</h3>
            <div className="relative mb-4">
              <div className="absolute inset-0 animate-ping bg-green-400 rounded-xl opacity-30 blur-lg"></div>
              <img
                src={payment.qrDataUrl}
                alt="Payment QR"
                className="w-48 h-48 border-4 border-green-400 rounded-xl p-2 bg-white relative z-10 shadow-lg mx-auto"
              />
            </div>
            <button
              onClick={downloadQR}
              className="mb-4 bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg transition-all duration-300 hover:scale-105"
            >
              Download QR
            </button>
          </>
        )}

        <button
          className="mt-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PaymentSuccess;
