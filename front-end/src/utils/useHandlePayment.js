// src/utils/useHandlePayment.js
import { useContext } from "react";
import QRCode from "qrcode";
import { AppContext } from "../context/AppContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

// Dynamically load Razorpay SDK
const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(false);
    document.body.appendChild(script);
  });

const useHandlePayment = () => {
  const { userData } = useContext(AppContext);

  const handlePayment = async (amount) => {
    try {
      const numericAmount = Number(amount);
      if (!numericAmount || numericAmount <= 0)
        throw new Error("Invalid amount");

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Razorpay SDK failed to load");

      // Get Razorpay key
      const keyRes = await fetch(`${backendUrl}/api/payment/razorpay-key`);
      const keyData = await keyRes.json();
      if (!keyData.key)
        throw new Error(keyData.message || "Razorpay key not found");

      // Create order
      const orderRes = await fetch(`${backendUrl}/api/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          amount: numericAmount,
          userId: userData?._id,
          name: userData?.name || "Guest",
          email: userData?.email || "guest@example.com",
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success)
        throw new Error(orderData.message || "Order creation failed");

      const order = orderData.order;

      const options = {
        key: keyData.key,
        amount: order.amount,
        currency: "INR",
        name: "HALLA GHAR",
        description: "Event Ticket Payment",
        order_id: order.id,
        handler: async (response) => {
          try {
            const qrText = `Payment Successful!
               Payment ID: ${response.razorpay_payment_id}
               Order ID: ${response.razorpay_order_id}
               Amount: ₹${order.amount / 100}
               Name: ${userData?.name || "Guest"}
               Email: ${userData?.email || "guest@example.com"}`;

            const qrDataUrl = await QRCode.toDataURL(qrText, { width: 300 });

            // Save payment
            await fetch(`${backendUrl}/api/payment/save`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                amount: order.amount / 100,
                name: userData?.name || "Guest",
                email: userData?.email || "guest@example.com",
                qrDataUrl,
                userId: userData?._id,
              }),
            });

            // Save order
            await fetch(`${backendUrl}/api/orders/save-order`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                paymentId: response.razorpay_payment_id,
                amount: order.amount / 100,
                eventId: null, // replace if event-specific
              }),
            });

            // Redirect to success page
            window.location.href = `/paymentSuccess/${response.razorpay_payment_id}`;
          } catch (err) {
            console.error("Error saving payment/order:", err);
            alert("Payment successful, but saving data failed.");
          }
        },
        theme: { color: "#111" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error("Payment error:", err);
      alert(err.message);
    }
  };

  return handlePayment;
};

export default useHandlePayment;
