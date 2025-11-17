import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Eye, EyeOff, Mail, KeyRound, User } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin, fetchUser } = useContext(AppContext);

  const [state, setState] = useState("login"); // "login" or "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = state === "signup" ? "register" : "login";
      const body = state === "signup" ? { name, email, password } : { email, password };

      const { data } = await axios.post(`${backendUrl}/api/auth/${endpoint}`, body);

      if (data.success && data.token) {
        // Save JWT in localStorage
        localStorage.setItem("token", data.token);

        // Fetch full user info
        await fetchUser();

        setIsLoggedin(true);
        toast.success(data.message);
        navigate("/"); // redirect home
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 px-4 sm:px-0">
      <div className="bg-gray-800 p-8 sm:p-10 rounded-xl shadow-lg w-full max-w-md text-white">
        <h1 className="text-3xl font-semibold text-center mb-3">
          {state === "signup" ? "Create your account" : "Welcome Back!"}
        </h1>
        <p className="text-center text-sm mb-6 text-gray-300">
          {state === "signup" ? "Sign up to get started" : "Login to your account"}
        </p>

        <form onSubmit={onSubmitHandler} className="flex flex-col gap-4 w-full">
          {state === "signup" && (
            <div className="flex items-center gap-3 w-full px-4 py-3 rounded-full bg-gray-700">
              <User className="text-gray-300" />
              <input
                type="text"
                placeholder="Full name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent outline-none text-white font-medium placeholder-gray-400"
              />
            </div>
          )}

          <div className="flex items-center gap-3 w-full px-4 py-3 rounded-full bg-gray-700">
            <Mail className="text-gray-300" />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent outline-none text-white font-medium placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-3 w-full px-4 py-3 rounded-full bg-gray-700">
            <KeyRound className="text-gray-300" />
            <input
              type={show ? "text" : "password"}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent outline-none text-white font-medium placeholder-gray-400"
            />
            <div onClick={() => setShow(!show)} className="cursor-pointer">
              {show ? <EyeOff className="text-gray-300" /> : <Eye className="text-gray-300" />}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-teal-400 text-white font-semibold hover:opacity-90 transition"
          >
            {loading ? "Please wait..." : state === "signup" ? "Sign Up" : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-400">
          {state === "signup" ? (
            <p>
              Already have an account?{" "}
              <span
                onClick={() => setState("login")}
                className="text-teal-400 cursor-pointer font-semibold hover:underline"
              >
                Login here
              </span>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <span
                onClick={() => setState("signup")}
                className="text-teal-400 cursor-pointer font-semibold hover:underline"
              >
                Sign up
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
