import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "./AppContext";

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Tokens stored ONLY in memory
  const [accessToken, setAccessToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  /* ----------------------------------------------------------
     REFRESH ACCESS TOKEN (httpOnly cookie)
  ---------------------------------------------------------- */
  const refreshAccessToken = useCallback(async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/auth/refresh-token`,
        {},
        { withCredentials: true }
      );

      const data = res.data;

      if (data.success && data.accessToken) {
        setAccessToken(data.accessToken);
        return data.accessToken;
      }

      // Refresh failed → fully logout
      setAccessToken(null);
      setUserData(null);
      setIsLoggedin(false);
      return null;

    } catch (err) {
      console.log("Refresh failed:", err.response?.data?.message || err.message);
      setAccessToken(null);
      setUserData(null);
      setIsLoggedin(false);
      return null;
    }
  }, [backendUrl]);

  /* ----------------------------------------------------------
     Add Authorization header automatically
  ---------------------------------------------------------- */
  useEffect(() => {
    const reqInterceptor = axios.interceptors.request.use((config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    return () => axios.interceptors.request.eject(reqInterceptor);
  }, [accessToken]);

  /* ----------------------------------------------------------
     Handle expired tokens globally
  ---------------------------------------------------------- */
  useEffect(() => {
    const resInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config;

        if (
          error.response?.data?.message === "ACCESS_TOKEN_EXPIRED" &&
          !original._retry
        ) {
          original._retry = true;

          const newToken = await refreshAccessToken();
          if (newToken) {
            original.headers.Authorization = `Bearer ${newToken}`;
            return axios(original);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(resInterceptor);
  }, [refreshAccessToken]);

  /* ----------------------------------------------------------
     Fetch user data
  ---------------------------------------------------------- */
  const fetchUser = useCallback(async () => {
    if (!accessToken) return;

    try {
      const authRes = await axios.get(`${backendUrl}/api/auth/is-auth`);

      if (authRes.data.success) {
        const userRes = await axios.post(`${backendUrl}/api/user/data`);

        if (userRes.data.success) {
          setUserData(userRes.data.userData);
          setIsLoggedin(true);
          return;
        }
      }

      // If failed
      setUserData(null);
      setIsLoggedin(false);
    } catch {
      setUserData(null);
      setIsLoggedin(false);
    }
  }, [backendUrl, accessToken]);

  /* ----------------------------------------------------------
     Auto-fetch user whenever accessToken updates
  ---------------------------------------------------------- */
  useEffect(() => {
    if (accessToken) {
      fetchUser();
    }
  }, [accessToken, fetchUser]);

  /* ----------------------------------------------------------
     Restore session on page refresh
  ---------------------------------------------------------- */
  useEffect(() => {
    const restore = async () => {
      const token = await refreshAccessToken();

      if (!token) {
        setIsLoggedin(false);
      }

      setLoading(false);
    };

    restore();
  }, []);

  /* ----------------------------------------------------------
     Fetch orders
  ---------------------------------------------------------- */
  const fetchOrders = useCallback(async () => {
    if (!accessToken) return;

    setOrdersLoading(true);

    try {
      const { data } = await axios.get(`${backendUrl}/api/orders/my-orders`, {
        withCredentials: true,
      });

      setOrders(data.success ? data.orders : []);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [backendUrl, accessToken]);

  /* ----------------------------------------------------------
     Logout
  ---------------------------------------------------------- */
  const logout = async () => {
    try {
      await axios.post(`${backendUrl}/api/auth/logout`, {}, { withCredentials: true });
    } catch {}

    setAccessToken(null);
    setUserData(null);
    setIsLoggedin(false);
    setOrders([]);

    toast.success("Logged out successfully.");
  };

  /* ----------------------------------------------------------
     Provider Export
  ---------------------------------------------------------- */
  return (
    <AppContext.Provider
      value={{
        backendUrl,
        accessToken,
        setAccessToken,
        userData,
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
