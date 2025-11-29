import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const MyOrders = () => {
  const { backendUrl, accessToken, loading } = useContext(AppContext);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/orders/my-orders`, {
        withCredentials: true,
      });

      if (data.success) {
        setOrders(data.orders);
      } else {
        setOrders([]);
        setError(data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    // WAIT until AppContext finishes restoring the session
    if (!loading && accessToken) {
      fetchOrders();
    }
  }, [loading, accessToken]);


  return (
    <section className="py-20 bg-black text-white min-h-screen">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-center mb-6 text-purple-500">My Orders</h1>

        {error && <p className="text-red-500 text-center mb-6">{error}</p>}

        {loading ? (
          <p className="text-gray-400 text-center">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-400 text-center mt-12">You have no orders yet.</p>
        ) : (
          <>
            <p className="text-gray-400 text-center mb-12">Total Orders: {orders.length}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.map((order) => {
                const event = order.eventId;
                const formattedDate = event?.date
                  ? new Date(event.date).toLocaleDateString()
                  : "N/A";

                return (
                  <div key={order._id} className="bg-neutral-900 border border-gray-700 rounded-xl p-5 shadow-lg">
                    <h2 className="text-xl font-bold text-white mb-2">
                      {event?.title || "Event Title Not Available"}
                    </h2>
                    <p className="text-gray-400 mb-1">
                      <strong>Date:</strong> {formattedDate}
                    </p>
                    <p className="text-gray-400 mb-1">
                      <strong>Location:</strong> {event?.location || "N/A"}
                    </p>
                    <p className="text-gray-400 mb-1">
                      <strong>Amount:</strong> ₹{order.amount?.toLocaleString() || "N/A"}
                    </p>
                    <p className="text-gray-400 mb-1">
                      <strong>Ticket ID:</strong> {order.paymentId || "N/A"}
                    </p>

                    <p className="text-sm mt-3">
                      <strong>Status:</strong>{" "}
                      <span
                        className={`font-semibold ${
                          order.status === "paid"
                            ? "text-green-400"
                            : order.status === "created"
                            ? "text-yellow-400"
                            : order.status === "failed"
                            ? "text-red-400"
                            : "text-gray-400"
                        }`}
                      >
                        {order.status || "N/A"}
                      </span>
                    </p>

                    {order.qrDataUrl && (
                      <div className="mt-4 text-center">
                        <img
                          src={order.qrDataUrl}
                          alt="Ticket QR"
                          className="w-32 h-32 object-contain mx-auto mb-2"
                        />
                        <a
                          href={order.qrDataUrl}
                          download={`ticket-${order._id}.png`}
                          className="text-purple-400 text-sm underline hover:text-purple-300"
                        >
                          Download Ticket
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default MyOrders;
