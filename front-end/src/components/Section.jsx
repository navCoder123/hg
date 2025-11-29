// src/pages/Section.jsx
import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { motion, useInView } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { AppContext } from "../context/AppContext";
import useHandlePayment from "../utils/useHandlePayment";
import { toast } from "react-toastify";
import img from "../assets/image.webp";

/* -------------------- SKELETON CARD -------------------- */
const SkeletonCard = () => (
  <div className="bg-neutral-900 border border-gray-700 rounded-xl shadow-lg animate-pulse">
    <div className="w-full h-60 bg-neutral-800 rounded-t-xl" />
    <div className="p-5">
      <div className="h-6 bg-neutral-800 rounded mb-3 w-3/4" />
      <div className="h-5 bg-neutral-800 rounded mb-2 w-1/3" />
      <div className="h-4 bg-neutral-800 rounded mb-1 w-1/2" />
      <div className="h-4 bg-neutral-800 rounded mb-1 w-1/4" />
      <div className="h-10 bg-neutral-800 rounded mt-4 w-full" />
    </div>
  </div>
);

/* -------------------- COUNTDOWN HOOK -------------------- */
const useCountdown = (dateString) => {
  const calc = () => {
    const target = new Date(dateString).getTime();
    const now = Date.now();
    let diff = Math.max(0, target - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);

    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);

    const seconds = Math.floor(diff / 1000);

    return { days, hours, minutes, seconds, total: target - now };
  };

  const [left, setLeft] = useState(calc());

  useEffect(() => {
    const int = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(int);
  }, []);

  return left;
};

/* -------------------- SPINNER -------------------- */
const Spinner = () => (
  <svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 50 50">
    <circle cx="25" cy="25" r="20" stroke="white" strokeWidth="5" fill="none" />
  </svg>
);

/* -------------------- COUNTDOWN DISPLAY -------------------- */
const CountdownDisplay = ({ date }) => {
  const { days, hours, minutes, seconds, total } = useCountdown(date);

  if (total <= 0)
    return <p className="text-red-400 text-sm font-semibold">Event Started</p>;

  return (
    <p className="text-gray-300 text-sm">
      {days}d {hours}h {minutes}m {seconds}s left
    </p>
  );
};

/* -------------------- MAIN COMPONENT -------------------- */
const Section = () => {
  const { backendUrl, userData, loading: authLoading } = useContext(AppContext);
  const handlePayment = useHandlePayment();

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [selectedEvent, setSelectedEvent] = useState(null);

  // Guest payment
  const [showPopup, setShowPopup] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [eventToPay, setEventToPay] = useState(null);

  // Prevent double payments
  const [processingEventId, setProcessingEventId] = useState(null);

  /* -------------------- FETCH EVENTS -------------------- */
  const fetchEvents = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/events`);
      setEvents(data.events || []);
    } catch (err) {
      toast.error("Failed to load events.");
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    document.body.style.overflow =
      selectedEvent || showPopup ? "hidden" : "auto";
  }, [selectedEvent, showPopup]);

  /* -------------------- HANDLE PAY -------------------- */
  const handlePayClick = (event) => {
    if (userData && !authLoading) return startPayment(event);

    // Guest flow
    setEventToPay(event);
    setShowPopup(true);
  };

  const startPayment = async (eventObj) => {
    if (!eventObj) return;

    if (processingEventId === eventObj._id) return; // prevent duplicate

    try {
      setProcessingEventId(eventObj._id);

      await handlePayment(Number(eventObj.amount), eventObj._id);

      toast.success("Payment successful!");

      // Close modals
      setSelectedEvent(null);
      setShowPopup(false);
      setEventToPay(null);
    } catch (error) {
      toast.error(error?.message || "Payment failed");
    } finally {
      setProcessingEventId(null);
    }
  };

  /* -------------------- GUEST POPUP SUBMIT -------------------- */
  const handlePopupSubmit = (e) => {
    e.preventDefault();

    if (!paymentInfo.name || !paymentInfo.email || !paymentInfo.phone)
      return toast.error("All fields required");

    startPayment(eventToPay);
  };

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section
        className="relative h-screen flex items-center justify-center text-center bg-black pt-24"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1549419163-f1df83526189?q=80&w=2940&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-70" />
        <div className="relative z-10 max-w-3xl px-6">
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold text-white mb-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Your Ticket to Unforgettable Live Experiences
          </motion.h1>

          <motion.p
            className="text-gray-300 text-lg md:text-xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Discover concerts, festivals, and live shows.
          </motion.p>

          <motion.button
            onClick={() =>
              window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
            }
            className="px-8 py-3 rounded-full font-semibold bg-gradient-to-r from-purple-600 to-teal-400 text-white shadow-lg hover:scale-105 transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            Explore All Events
          </motion.button>
        </div>
      </section>

      {/* ---------------- EVENTS ---------------- */}
      <section className="py-20 bg-black text-white relative" id="events">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-center mb-12">
            Upcoming Events
          </h2>

          {loadingEvents ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : events.length === 0 ? (
            <p className="text-gray-400 text-center">No events available.</p>
          ) : (
            <>
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                navigation={{ nextEl: ".next", prevEl: ".prev" }}
                pagination={{ clickable: true }}
                autoplay={{ delay: 4000 }}
                loop={true}
                grabCursor={true}
                breakpoints={{
                  640: { slidesPerView: 1 },
                  768: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
              >
                {events.map((event) => (
                  <SwiperSlide key={event._id}>
                    <Card
                      event={event}
                      backendUrl={backendUrl}
                      onClick={() => setSelectedEvent(event)}
                      onPay={() => handlePayClick(event)}
                      processingEventId={processingEventId}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              <button className="prev hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 text-4xl text-white bg-white/10 px-6 py-3 rounded-r-full">
                ‹
              </button>

              <button className="next hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 text-4xl text-white bg-white/10 px-6 py-3 rounded-l-full">
                ›
              </button>
            </>
          )}
        </div>
      </section>

      {/* ---------------- EVENT MODAL ---------------- */}
      {selectedEvent && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[900] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={(e) =>
            e.target.classList.contains("fixed") && setSelectedEvent(null)
          }
        >
          <motion.div
            className="relative bg-neutral-900 text-white rounded-xl p-6 max-w-lg w-full border border-gray-700 shadow-xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <button
              className="absolute top-3 right-4 text-2xl text-red-400"
              onClick={() => setSelectedEvent(null)}
            >
              ×
            </button>

            <img
              src={
                selectedEvent.imageUrl
                  ? `${backendUrl}${selectedEvent.imageUrl}`
                  : img
              }
              alt={selectedEvent.title}
              className="w-full h-56 object-cover rounded-lg mb-4"
              onError={(e) => (e.target.src = img)}
            />

            <h2 className="text-2xl font-bold mb-2">{selectedEvent.title}</h2>

            <p className="text-gray-300 mb-1">
              Price: ₹{selectedEvent.amount}
            </p>
            <p className="text-gray-300 mb-1">Date: {selectedEvent.date}</p>
            <p className="text-gray-300 mb-1">
              Location: {selectedEvent.location}
            </p>
            <p className="text-gray-300 mb-1">Genre: {selectedEvent.genre}</p>

            <CountdownDisplay date={selectedEvent.date} />

            <button
              onClick={() => handlePayClick(selectedEvent)}
              disabled={processingEventId === selectedEvent._id}
              className="w-full mt-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-teal-400 text-white font-semibold flex justify-center items-center"
            >
              {processingEventId === selectedEvent._id && <Spinner />}
              Pay Now
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* ---------------- GUEST PAYMENT POPUP ---------------- */}
      {showPopup && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[900] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-neutral-900 text-white p-6 rounded-xl max-w-md w-full border border-gray-700 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-center">
              Guest Payment Details
            </h2>

            <form onSubmit={handlePopupSubmit}>
              <label className="text-gray-300">Name</label>
              <input
                type="text"
                className="w-full bg-neutral-800 border border-gray-700 p-2 rounded mt-1 mb-3"
                value={paymentInfo.name}
                onChange={(e) =>
                  setPaymentInfo({ ...paymentInfo, name: e.target.value })
                }
              />

              <label className="text-gray-300">Email</label>
              <input
                type="email"
                className="w-full bg-neutral-800 border border-gray-700 p-2 rounded mt-1 mb-3"
                value={paymentInfo.email}
                onChange={(e) =>
                  setPaymentInfo({ ...paymentInfo, email: e.target.value })
                }
              />

              <label className="text-gray-300">Phone</label>
              <input
                type="tel"
                className="w-full bg-neutral-800 border border-gray-700 p-2 rounded mt-1 mb-3"
                value={paymentInfo.phone}
                onChange={(e) =>
                  setPaymentInfo({ ...paymentInfo, phone: e.target.value })
                }
              />

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPopup(false);
                    setEventToPay(null);
                  }}
                  className="w-1/2 py-2 bg-gray-700 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={processingEventId === eventToPay?._id}
                  className="w-1/2 py-2 bg-gradient-to-r from-purple-600 to-teal-400 rounded flex justify-center items-center"
                >
                  {processingEventId === eventToPay?._id && <Spinner />}
                  Continue
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </>
  );
};

/* -------------------- CARD COMPONENT -------------------- */
const Card = ({
  event,
  backendUrl,
  onClick,
  onPay,
  processingEventId,
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const soldOut =
    event.soldOut ||
    (typeof event.ticketsLeft !== "undefined" && event.ticketsLeft <= 0);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      className="bg-neutral-900 border border-gray-700 rounded-xl shadow-lg hover:shadow-2xl transition p-0 cursor-default"
    >
      <div className="relative">
        <img
          src={event.imageUrl ? `${backendUrl}${event.imageUrl}` : img}
          alt={event.title}
          className="w-full h-60 object-cover rounded-t-xl cursor-pointer"
          onClick={onClick}
          onError={(e) => (e.target.src = img)}
        />

        {soldOut && (
          <span className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 text-xs rounded">
            SOLD OUT
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold">{event.title}</h3>
        <p className="text-white font-bold mt-1">₹{event.amount}</p>

        <p className="text-gray-400 text-sm mt-2">{event.date}</p>
        <p className="text-gray-400 text-sm">{event.location}</p>

        <p className="text-teal-400 text-sm mt-3">Genre: {event.genre}</p>

        <div className="mt-3">
          <CountdownDisplay date={event.date} />
        </div>

        <button
          disabled={soldOut || processingEventId === event._id}
          onClick={() => onPay(event)}
          className={`w-full mt-4 py-2 rounded-full flex justify-center items-center text-white font-semibold ${
            soldOut
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:scale-105"
          }`}
        >
          {processingEventId === event._id && <Spinner />}
          {soldOut ? "Sold Out" : "BOOK NOW"}
        </button>
      </div>
    </motion.div>
  );
};

export default Section;
