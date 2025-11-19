// src/pages/EventPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { AppContext } from "../context/AppContext";
import useHandlePayment from "../utils/useHandlePayment";
import { toast } from "react-toastify";
import img from "../assets/image.webp";

const EventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { backendUrl, userData } = useContext(AppContext);
  const handlePayment = useHandlePayment();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Guest payment popup
  const [showPopup, setShowPopup] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/events/${id}`);
        if (data.success) setEvent(data.event);
        else toast.error("Event not found");
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // startPayment (same flow as Section)
  const startPayment = async (info, eventObj) => {
    try {
      await handlePayment(eventObj.amount, {
        name: info.name,
        email: info.email,
        phone: info.phone,
        eventId: eventObj._id,
      });
      setShowPopup(false);
      toast.success("Payment successful");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Payment failed");
    }
  };

  const handlePayClick = (eventObj) => {
    if (userData?.name && userData?.email) {
      startPayment(
        {
          name: userData.name,
          email: userData.email,
          phone: userData.phone || "N/A",
        },
        eventObj
      );
      return;
    }

    setShowPopup(true);
  };

  const handlePopupSubmit = (e) => {
    e.preventDefault();
    if (!paymentInfo.name || !paymentInfo.email || !paymentInfo.phone) {
      toast.error("All fields are required.");
      return;
    }
    startPayment(paymentInfo, event);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-gray-400">Event not found.</p>
        <button onClick={() => navigate(-1)} className="ml-4 text-white underline">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero image */}
      <div className="w-full h-[45vh] md:h-[60vh] relative">
        <img
          src={event.imageUrl ? `${backendUrl}${event.imageUrl}` : img}
          onError={(e) => (e.target.src = img)}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 z-10">
          <h1 className="text-2xl md:text-4xl font-extrabold">{event.title}</h1>
          <p className="text-gray-300 mt-1">
            ₹{Number(event.amount).toLocaleString("en-IN")} • {event.date} • {event.location}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-xl md:text-2xl font-bold mb-4">About the Event</h2>
            <p className="text-gray-300 leading-relaxed">{event.description}</p>
          </div>

          <aside className="bg-neutral-900 border border-gray-700 p-6 rounded-xl">
            <p className="text-gray-400 mb-3">
              <strong className="text-purple-400">Date:</strong> {event.date}
            </p>
            <p className="text-gray-400 mb-3">
              <strong className="text-purple-400">Location:</strong> {event.location}
            </p>
            <p className="text-gray-400 mb-3">
              <strong className="text-purple-400">Genre:</strong> {event.genre}
            </p>

            <button
              onClick={() => handlePayClick(event)}
              className="mt-6 w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-teal-400 text-white font-semibold"
            >
              Pay Now
            </button>
          </aside>
        </div>
      </div>

      {/* Guest Payment Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-neutral-900 text-white p-6 rounded-xl max-w-md w-full border border-gray-700 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-center">Enter Your Details</h2>

            <form onSubmit={handlePopupSubmit}>
              <div className="mb-3">
                <label className="text-gray-300">Name</label>
                <input
                  type="text"
                  className="w-full p-2 rounded bg-neutral-800 border border-gray-700 mt-1"
                  value={paymentInfo.name}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, name: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="text-gray-300">Email</label>
                <input
                  type="email"
                  className="w-full p-2 rounded bg-neutral-800 border border-gray-700 mt-1"
                  value={paymentInfo.email}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, email: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="text-gray-300">Phone Number</label>
                <input
                  type="tel"
                  className="w-full p-2 rounded bg-neutral-800 border border-gray-700 mt-1"
                  value={paymentInfo.phone}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, phone: e.target.value })}
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="w-1/2 py-2 rounded bg-gray-700 hover:bg-gray-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-1/2 py-2 rounded bg-gradient-to-r from-purple-600 to-teal-400 font-semibold"
                >
                  Continue to Pay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventPage;
