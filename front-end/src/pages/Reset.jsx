import React, { useContext, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Reset = () => {
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [checkEmailSend, setEmailCheck] = useState(false);
  const [otp, setOtp] = useState("");
  const [checkOtp, setCheckOtp] = useState(false);

  const inputRefs = useRef([]);

  const handleInputs = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").trim().slice(0, 6);
    paste.split("").forEach((char, index) => {
      if (inputRefs.current[index]) inputRefs.current[index].value = char;
    });
    const nextEmpty = inputRefs.current.findIndex((input) => input.value === "");
    if (nextEmpty !== -1) inputRefs.current[nextEmpty].focus();
  };

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, { email });
      if (data.success) {
        toast.success(data.message);
        setEmailCheck(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onSubmitOtp = (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map((input) => input.value).join("");
    setOtp(otpArray);
    setCheckOtp(true);
  };

  const onSubmitPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/reset-password`,
        { email, otp, newPassword },
        { validateStatus: () => true }
      );

      if (response.status === 204 || response.data?.success) {
        toast.success(response.data?.message || "Password reset successful");
        navigate("/login");
      } else {
        toast.error(response.data?.message || "Something went wrong");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Email Form */}
      {!checkEmailSend && (
        <form onSubmit={onSubmitEmail} className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-sm">
          <h1 className="text-center mb-6 text-indigo-400 text-xl sm:text-2xl font-semibold">RESET PASSWORD</h1>
          <div className="mb-4 flex items-center gap-3 w-full px-4 py-2 rounded-full bg-gray-700">
            <input
              type="email"
              placeholder="Email"
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3 font-semibold hover:opacity-90 transition">
            SUBMIT
          </button>
        </form>
      )}

      {/* OTP Form */}
      {!checkOtp && checkEmailSend && (
        <form onSubmit={onSubmitOtp} className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-sm mt-4">
          <h1 className="text-center mb-6 text-indigo-400 text-xl sm:text-2xl font-semibold">Enter OTP</h1>
          <div className="flex justify-between mb-6" onPaste={handlePaste}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  type="text"
                  maxLength="1"
                  key={index}
                  required
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-700 text-white text-center text-lg sm:text-xl rounded-md"
                  ref={(el) => (inputRefs.current[index] = el)}
                  onInput={(e) => handleInputs(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
          </div>
          <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full font-semibold hover:opacity-90 transition">
            SUBMIT
          </button>
        </form>
      )}

      {/* New Password Form */}
      {checkOtp && checkEmailSend && (
        <form onSubmit={onSubmitPassword} className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-sm mt-4">
          <h1 className="text-center mb-6 text-indigo-400 text-xl sm:text-2xl font-semibold">New Password</h1>
          <div className="mb-4 flex items-center gap-3 w-full px-4 py-2 rounded-full bg-gray-700">
            <input
              type="password"
              placeholder="New Password"
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3 font-semibold hover:opacity-90 transition">
            SUBMIT
          </button>
        </form>
      )}
    </div>
  );
};

export default Reset;
