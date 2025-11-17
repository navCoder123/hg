import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Header = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedin, fetchUser, logout, loading } = useContext(AppContext);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // On mount, fetch user if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !userData) {
      fetchUser();
    }
  }, [fetchUser, userData]);

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const sendVerifycode = async () => {
    if (!userData?._id) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-verify-otp`,
        { userId: userData._id },
        { headers: getAuthHeader() }
      );
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

  if (loading) return null; // Wait until user data is loaded

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? "bg-black/90 backdrop-blur-md shadow-lg" : "bg-black/60 backdrop-blur-sm"}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div
          onClick={() => {
            if (userData && !userData.isAccountVerified) {
              sendVerifycode();
            } else {
              navigate("/");
            }
          }}
          className="text-2xl font-extrabold text-white tracking-tight cursor-pointer"
        >
          <span className="text-green-500">HALLA</span>ENTRY
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#events" className="text-gray-300 hover:text-purple-400 transition">EVENTS</a>
          <a href="#about" className="text-gray-300 hover:text-purple-400 transition">ABOUT</a>
          <a href="#contact" className="text-gray-300 hover:text-purple-400 transition">CONTACT</a>
          {userData && (
            <button onClick={() => navigate("/my-orders")} className="text-gray-300 hover:text-purple-400 transition font-semibold">
              MY ORDERS
            </button>
          )}
        </nav>

        {/* Auth / User */}
        {userData ? (
          <div className="relative group">
            <div className="w-10 h-10 flex justify-center items-center rounded-full bg-gradient-to-r from-purple-600 to-teal-400 text-white font-semibold cursor-pointer shadow-md">
              {userData.name[0].toUpperCase()}
            </div>

            {/* Dropdown */}
            <div className="absolute right-0 top-0 hidden group-hover:block bg-neutral-900 border border-gray-700 rounded-lg overflow-hidden shadow-xl">
              <ul className="text-sm text-gray-300">
                {!userData.isAccountVerified && (
                  <li onClick={sendVerifycode} className="px-4 py-2 hover:bg-neutral-800 cursor-pointer">
                    Verify Email
                  </li>
                )}
                <li onClick={logout} className="px-4 py-2 hover:bg-neutral-800 cursor-pointer">
                  Logout
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <button onClick={() => navigate("/login")} className="hidden md:block bg-gradient-to-r from-purple-600 to-teal-400 text-white px-6 py-2 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300">
            Login
          </button>
        )}

        {/* Mobile Menu Button */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white hover:scale-110 transition">
          {mobileMenuOpen ? (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
