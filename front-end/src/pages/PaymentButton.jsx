// src/pages/PaymentButton.jsx
import React, { useState } from "react";
import useHandlePayment from "../utils/useHandlePayment";
import events from "../components/Models";

const PaymentButton = () => {
  const handlePayment = useHandlePayment();
  const [buttonLoading, setButtonLoading] = useState(null);

  const onPayClick = async (amount, event) => {
    console.log("Buy button clicked!", event);
    setButtonLoading(event.id);
    try {
      await handlePayment(amount); // no userData required
    } catch (err) {
      console.error("Payment failed:", err);
    } finally {
      setButtonLoading(null);
    }
  };

  return (
    <div className="w-96 border-2 m-auto my-20 rounded-2xl p-4 flex flex-col gap-4">
      <h1 className="text-center font-bold text-xl">Select Event to Pay</h1>

      {events.map((event) => (
        <div
          key={event.id}
          className="flex justify-between items-center border-b py-2"
        >
          <span>
            {event.title}: ₹{event.amount}
          </span>
          <button
            onClick={() => onPayClick(event.amount, event)}
            className="bg-black text-white py-1 px-4 rounded hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {buttonLoading === event.id ? "Processing..." : "Pay"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default PaymentButton;
