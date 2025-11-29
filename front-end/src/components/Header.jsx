import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Header = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, logout, fetchUser, loading } = useContext(AppContext);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !userData) fetchUser();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sendVerifycode = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/send-verify-otp`, {
        userId: userData._id,
      });
      if (data.success) {
        toast.success(data.message);
        navigate("/email-verify");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  if (loading) return null;

  return (
    <header
      className={`fixed w-full z-[999] transition-all duration-300 ${
        isScrolled
          ? "bg-black/90 backdrop-blur-md shadow-lg"
          : "bg-black/60 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          className="text-2xl font-extrabold text-white cursor-pointer"
        >
          <span className="text-green-500">HALLA</span>ENTRY
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#events" className="text-gray-300 hover:text-purple-400">EVENTS</a>
          <a href="#about" className="text-gray-300 hover:text-purple-400">ABOUT</a>
          <a href="#contact" className="text-gray-300 hover:text-purple-400">CONTACT</a>
          {userData && (
            <button
              onClick={() => navigate("/my-orders")}
              className="text-gray-300 hover:text-purple-400 font-semibold"
            >
              MY ORDERS
            </button>
          )}
        </nav>

        {/* Auth */}
        {userData ? (
          <div className="relative group">
            <div className="w-10 h-10 flex justify-center items-center rounded-full 
            bg-gradient-to-r from-purple-600 to-teal-400 cursor-pointer text-white font-bold">
              {userData.name[0].toUpperCase()}
            </div>

            <div
              className="absolute right-0 top-12 hidden group-hover:block bg-neutral-900
              border border-gray-700 rounded-lg shadow-xl overflow-hidden z-[1200]"
            >
              <ul className="text-sm text-gray-300">
                {!userData.isAccountVerified && (
                  <li
                    onClick={sendVerifycode}
                    className="px-4 py-2 hover:bg-neutral-800 cursor-pointer"
                  >
                    Verify Email
                  </li>
                )}

                <li
                  onClick={logout}
                  className="px-4 py-2 hover:bg-neutral-800 cursor-pointer"
                >
                  Logout
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="hidden md:block bg-gradient-to-r from-purple-600 to-teal-400
            text-white px-6 py-2 rounded-full font-semibold shadow-md hover:shadow-lg"
          >
            Login
          </button>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white"
        >
          {mobileMenuOpen ? (
            <svg className="w-7 h-7" fill="none" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="none" stroke="currentColor">
              <path d="M4 6h16M4 12h16m-7 6h7" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`md:hidden bg-black/80 backdrop-blur-sm overflow-hidden transition-all ${
          mobileMenuOpen
            ? "max-h-[500px] py-4 pointer-events-auto"
            : "max-h-0 pointer-events-none"
        }`}
      >
        <div className="px-6 flex flex-col gap-3">
          <a href="#events" className="text-gray-300">EVENTS</a>
          <a href="#about" className="text-gray-300">ABOUT</a>
          <a href="#contact" className="text-gray-300">CONTACT</a>

          {userData ? (
            <>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/my-orders");
                }}
                className="text-gray-300"
              >
                MY ORDERS
              </button>

              {!userData.isAccountVerified && (
                <button
                  onClick={sendVerifycode}
                  className="text-gray-300"
                >
                  Verify Email
                </button>
              )}

              <button onClick={logout} className="text-gray-300">
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/login");
              }}
              className="bg-gradient-to-r from-purple-600 to-teal-400
              text-white px-4 py-2 rounded-full font-semibold shadow-md"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
