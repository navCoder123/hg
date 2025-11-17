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

const Section = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const handlePayment = useHandlePayment();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Fetch events
  const fetchEvents = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/events`);
      if (data.success) setEvents(data.events);
    } catch (err) {
      console.error("Error fetching events:", err);
      toast.error("Failed to load events.");
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = selectedEvent ? "hidden" : "auto";
  }, [selectedEvent]);

  // Payment handler (works for logged in or guest)
  const handlePayClick = async (event) => {
    try {
      const name = userData?.name || prompt("Enter your name");
      const email = userData?.email || prompt("Enter your email");

      if (!name || !email) {
        toast.error("Name and email are required to proceed!");
        return;
      }

      await handlePayment(event.amount, { name, email, eventId: event._id });
    } catch (err) {
      toast.error(err.message || "Payment failed");
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center text-center bg-black"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1549419163-f1df83526189?q=80&w=2940&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        <div className="relative z-10 max-w-3xl px-6" id="home">
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight"
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
            Discover, book, and enjoy the best concerts, festivals, and live shows.
          </motion.p>
          <motion.button
            onClick={() =>
              window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
            }
            className="px-8 py-3 rounded-full font-semibold bg-gradient-to-r from-purple-600 to-teal-400 text-white shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            Explore All Events
          </motion.button>
        </div>
      </section>

      {/* Upcoming Events Slider */}
      <section className="py-20 bg-black text-white relative" id="events">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12">
            Upcoming Events
          </h2>

          {loadingEvents ? (
            <p className="text-gray-400 text-center">Loading events...</p>
          ) : events.length === 0 ? (
            <p className="text-gray-400 text-center">No events available yet.</p>
          ) : (
            <>
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                navigation={{ nextEl: ".custom-next", prevEl: ".custom-prev" }}
                pagination={{ clickable: true }}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
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
                    <AnimatedCard
                      event={event}
                      backendUrl={backendUrl}
                      onClick={() => setSelectedEvent(event)}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Navigation Arrows */}
              <div className="hidden md:flex absolute inset-y-0 left-0 items-center">
                <button className="custom-prev bg-white/20 hover:bg-white/40 text-white text-5xl font-bold px-10 py-5 rounded-r-full shadow-xl transition-all duration-300">
                  ‹
                </button>
              </div>
              <div className="hidden md:flex absolute inset-y-0 right-0 items-center">
                <button className="custom-next bg-white/20 hover:bg-white/40 text-white text-5xl font-bold px-10 py-5 rounded-l-full shadow-xl transition-all duration-300">
                  ›
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Event Modal */}
      {selectedEvent && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4"
          onClick={(e) =>
            e.target.classList.contains("fixed") && setSelectedEvent(null)
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="relative bg-neutral-900 text-white rounded-xl p-6 max-w-lg w-full border border-gray-700 shadow-2xl overflow-y-auto max-h-[90vh]"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="absolute top-3 right-4 text-2xl font-bold text-red-500 hover:text-red-600"
              onClick={() => setSelectedEvent(null)}
            >
              ×
            </button>

            <img
              src={selectedEvent.imageUrl ? `${backendUrl}${selectedEvent.imageUrl}` : img}
              alt={selectedEvent.title}
              className="w-full h-56 object-cover rounded-lg mb-4"
            />
            <h2 className="text-2xl font-bold mb-2">{selectedEvent.title}</h2>
            <p className="text-gray-400 mb-1">
              <strong>Price:</strong> ₹{Number(selectedEvent.amount).toLocaleString("en-IN")}
            </p>
            <p className="text-gray-400 mb-1">
              <strong>Date:</strong> {selectedEvent.date}
            </p>
            <p className="text-gray-400 mb-1">
              <strong>Location:</strong> {selectedEvent.location}
            </p>
            <p className="text-gray-400 mb-1">
              <strong>Genre:</strong> {selectedEvent.genre}
            </p>
            <p className="text-gray-300 mt-3 leading-relaxed">{selectedEvent.description}</p>

            {/* Payment Button */}
            <button
              onClick={() => handlePayClick(selectedEvent)}
              className="w-full mt-6 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-purple-600 to-teal-400 hover:scale-105 transition-transform"
            >
              Pay Now
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

// Animated Card Component
const AnimatedCard = ({ event, backendUrl, onClick }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      className="bg-neutral-900 border border-gray-700 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      <img
        src={event.imageUrl ? `${backendUrl}${event.imageUrl}` : img}
        onError={(e) => (e.target.src = img)}
        alt={event.title}
        className="w-full h-60 object-cover rounded-t-xl"
        loading="lazy"
      />
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-1">{event.title}</h3>
        <p className="text-gray-400 font-semibold mb-2">
          ₹{Number(event.amount).toLocaleString("en-IN")}
        </p>
        <p className="text-gray-500 text-sm">{event.date}</p>
        <p className="text-gray-500 text-sm">{event.location}</p>
        <p className="text-teal-400 text-sm mt-2 font-medium">Genre: {event.genre}</p>
        <button className="w-full mt-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-semibold hover:scale-105 transition-transform">
          More Details
        </button>
      </div>
    </motion.div>
  );
};

export default Section;
