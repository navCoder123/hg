// src/context/AppContextProvider.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "./AppContext";

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [userData, setUserData] = useState(null);
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [loading, setLoading] = useState(true); // auth check loading
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Helper: get Authorization header
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch current user info from backend
  // Inside AppContextProvider.jsx

const fetchUser = useCallback(async () => {
  try {
    setLoading(true);

    // Add no-cache header and a timestamp query param to avoid 304
    const { data } = await axios.get(`${backendUrl}/api/auth/is-auth?_=${Date.now()}`, {
      headers: {
        ...getAuthHeader(),
      },
    });

    if (data.success) {
      // fetch full user data
      const userRes = await axios.get(`${backendUrl}/api/user/data?_=${Date.now()}`, {
        headers: {
          ...getAuthHeader(),
          "Cache-Control": "no-cache",
        },
      });

      if (userRes.data.success) {
        setUserData(userRes.data.userData);
        setIsLoggedin(true);
      } else {
        setUserData(null);
        setIsLoggedin(false);
      }
    } else {
      setUserData(null);
      setIsLoggedin(false);
    }
  } catch (err) {
    setUserData(null);
    setIsLoggedin(false);
    console.error("Auth check failed:", err.response?.data?.message || err.message);
  } finally {
    setLoading(false);
  }
}, [backendUrl]);


  // Fetch orders for logged-in user
  const fetchOrders = useCallback(async () => {
    if (!userData?._id) return;
    setOrdersLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/orders/my-orders`, {
        headers: getAuthHeader(),
      });
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err.response?.data?.message || err.message);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [backendUrl, userData]);

  // Check auth on app load
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUserData(null);
    setIsLoggedin(false);
    setOrders([]);
    toast.success("Logged out successfully.");
  };

  return (
    <AppContext.Provider
      value={{
        backendUrl,
        userData,
        setUserData,
        isLoggedin,
        setIsLoggedin,
        fetchUser,
        fetchOrders,
        orders,
        ordersLoading,
        logout,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
