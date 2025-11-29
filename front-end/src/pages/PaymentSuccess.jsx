import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentSuccess = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!paymentId) {
      navigate("/");
      return;
    }

    const fetchPayment = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/payment/${paymentId}`
        );

        if (res.data?.payment) {
          setPayment(res.data.payment);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.log("Waiting for webhook to save payment...");
      }

      // Retry logic (max 10 retries → 10 seconds)
      if (retryCount < 10) {
        setRetryCount((prev) => prev + 1);
        setTimeout(fetchPayment, 1000);
      } else {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId, navigate, retryCount]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center animate-pulse text-lg">
          Processing Payment... Please wait
        </div>
      </div>
    );

  if (!payment)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6">
        <h2 className="text-xl font-semibold mb-4">
          Payment is processing or not found.
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded transition-all duration-300 hover:scale-105 mb-3"
        >
          Retry
        </button>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded transition-all duration-300 hover:scale-105"
        >
          Go Home
        </button>
      </div>
    );

  const downloadQR = () => {
    const link = document.createElement("a");
    link.href = payment.qrDataUrl;
    link.download = "payment_qr.png";
    link.click();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white px-4">
      <div className="bg-gray-800/70 backdrop-blur-xl p-7 sm:p-9 rounded-2xl shadow-2xl text-center max-w-sm sm:max-w-md w-full border border-gray-700 animate-fadeIn">
        <div className="text-green-400 mb-4 text-5xl font-extrabold tracking-wide">
          HALLA GHAR
        </div>

        <h2 className="text-3xl font-bold text-green-400 mb-5 animate-pulse">
          Payment Successful!
        </h2>

        <div className="text-gray-300 mb-6 text-sm sm:text-base space-y-1">
          <p><strong>Payment ID:</strong> {payment.paymentId}</p>
          <p><strong>Order ID:</strong> {payment.orderId}</p>
          <p><strong>Amount Paid:</strong> ₹{payment.amount}</p>
          <p><strong>Name:</strong> {payment.name}</p>
          <p><strong>Email:</strong> {payment.email}</p>
        </div>

        <h3 className="font-semibold mb-3 text-green-300 text-lg">
          Your QR Code
        </h3>

        <div className="relative mb-5">
          <div className="absolute inset-0 animate-ping bg-green-400 rounded-xl opacity-20 blur-xl"></div>

          <img
            src={payment.qrDataUrl}
            alt="QR Code"
            className="w-48 h-48 border-4 border-green-400 rounded-xl p-2 bg-white z-10 shadow-lg mx-auto"
          />
        </div>

        <button
          onClick={downloadQR}
          className="mb-4 bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg transition-all duration-300 hover:scale-105 w-full"
        >
          Download QR
        </button>

        <button
          className="mt-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105 w-full"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(25px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PaymentSuccess;
