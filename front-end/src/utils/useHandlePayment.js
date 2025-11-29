// src/utils/useHandlePayment.js
import { useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Load Razorpay SDK dynamically
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const useHandlePayment = () => {
  const { userData } = useContext(AppContext);

  const handlePayment = async (amount, eventId) => {
    try {
      if (!amount || amount <= 0) throw new Error("Invalid amount");

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Razorpay failed to load");

      // 1. GET RAZORPAY KEY
      const keyRes = await axios.get(`${backendUrl}/api/payment/razorpay-key`);
      const key = keyRes.data.key;

      // 2. CREATE ORDER (axios automatically sends Authorization token)
      const orderRes = await axios.post(
        `${backendUrl}/api/payment/create-order`,
        { 
          amount,
          eventId,
          name: userData?.name,
          email: userData?.email,
        },
        { withCredentials: true , headers: {},}

      );

      if (!orderRes.data.success) throw new Error("Order creation failed");

      const order = orderRes.data.order;

      // 3. OPEN RAZORPAY CHECKOUT
      const options = {
        key,
        amount: order.amount,
        currency: "INR",
        name: "HALLA GHAR",
        description: "Event Ticket",
        order_id: order.id,
        handler: async (response) => {
         window.location.href = `/payment-success/${response.razorpay_payment_id}`;
        },
        prefill: {
          name: userData?.name || "",
          email: userData?.email || "",
        },
        theme: { color: "#111" },
      };
      console.log("ORDER RESPONSE:", orderRes.data);

      const razorpayObject = new window.Razorpay(options);
      razorpayObject.open();
    } catch (err) {
      console.error("Payment error:", err);
      throw err;
    }
  };

  return handlePayment;
};

export default useHandlePayment;
