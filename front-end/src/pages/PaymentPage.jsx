import React, { useState } from "react";
import handlePayment from "../utils/useHandlePayment";

const PaymentPage = () => {
  const [amount, setAmount] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [paymentInfo, setPaymentInfo] = useState(null);

  const handlePayClick = () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Enter a valid amount");
      return;
    }

    // Override handlePayment to capture QR and payment info
    handlePayment(amount, async (response, dataUrl) => {
      setPaymentInfo(response);
      setQrDataUrl(dataUrl);
      setPaymentSuccess(true);
    });
  };

  if (paymentSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-semibold mb-4">Payment Successful!</h2>
        <p className="mb-2">Payment ID: {paymentInfo.razorpay_payment_id}</p>
        <p className="mb-2">Order ID: {paymentInfo.razorpay_order_id}</p>
        <p className="mb-4">Amount: ₹{amount}</p>

        <h3 className="mb-2 font-semibold">Your QR Code:</h3>
        <img src={qrDataUrl} alt="Payment QR" className="border p-2 rounded mb-4" />

        <button
          className="bg-green-500 text-white px-6 py-2 rounded hover:opacity-90 transition"
          onClick={() => window.location.reload()}
        >
          Pay Another
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-xl font-semibold mb-4">Pay for Event</h2>
      <input
        type="number"
        placeholder="Enter amount in INR"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border p-2 rounded mb-4 w-60"
      />
      <button
        onClick={handlePayClick}
        className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-2 rounded hover:opacity-90 transition"
      >
        Pay Now
      </button>
    </div>
  );
};

export default PaymentPage;
