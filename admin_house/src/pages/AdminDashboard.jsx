// src/pages/AdminDashboard.jsx

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Html5Qrcode } from "html5-qrcode";
import EventModal from "../components/EventModal";
import EventCard from "../components/EventCard";

const AdminDashboard = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({});
  const [scanEventId, setScanEventId] = useState(null);

  const [scannedData, setScannedData] = useState("");
  const [qrList, setQrList] = useState([]);

  const html5QrcodeRef = useRef(null);

  // Fetch events
  const fetchEvents = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/events`);
      if (data.success) setEvents(data.events);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Add Event
  const handleAddEvent = async () => {
    try {
      await axios.post(`${backendUrl}/api/events`, formData);
      setIsAdding(false);
      setFormData({});
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  // Update Event
  const handleUpdate = async () => {
    try {
      await axios.put(`${backendUrl}/api/events/${selectedEvent._id}`, formData);
      setSelectedEvent(null);
      setFormData({});
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Event
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${backendUrl}/api/events/${id}`);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  // Edit Event
  const handleEditClick = (event) => {
    setSelectedEvent(event);
    setFormData({ ...event });
  };

  // Start Scanner
  const startScanner = (eventId) => {
    setScanEventId(eventId);
    setScannedData("");
    fetchQrList(eventId);
  };

  // Fetch QR list for an event
  const fetchQrList = async (eventId) => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/qr/${eventId}`);
      if (data.success) setQrList(data.qrList);
    } catch (err) {
      console.error("Error fetching QR codes:", err);
    }
  };

  // Initialize Scanner
  useEffect(() => {
    if (!scanEventId) return;

    // Clear old instance before creating new
    if (html5QrcodeRef.current) {
      html5QrcodeRef.current.stop().catch(() => {});
      html5QrcodeRef.current.clear().catch(() => {});
    }

    html5QrcodeRef.current = new Html5Qrcode("qr-scanner");

    html5QrcodeRef.current
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          if (scannedData === decodedText) return; // Prevent duplicate read
          setScannedData(decodedText);

          try {
            await axios.post(`${backendUrl}/api/qr/scan`, {
              eventId: scanEventId,
              scannedBy: "admin",
              data: decodedText,
            });

            fetchQrList(scanEventId);
          } catch (err) {
            console.error("Error saving QR scan:", err);
          } finally {
            html5QrcodeRef.current.stop();
          }
        }
      )
      .catch((err) => console.error("QR scanner failed to start:", err));

    // Cleanup on close or component unmount
    return () => {
      if (html5QrcodeRef.current) {
        html5QrcodeRef.current.stop().catch(() => {});
        html5QrcodeRef.current.clear().catch(() => {});
      }
    };
  }, [scanEventId]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Add Event
        </button>
      </div>

      {/* Events */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {events.map((event) => (
          <div key={event._id} className="relative">
            <EventCard
              event={event}
              onEdit={handleEditClick}
              onDelete={handleDelete}
              backendUrl={backendUrl}
            />

            <button
              onClick={() => startScanner(event._id)}
              className="absolute top-2 right-2 bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
            >
              Scan QR
            </button>
          </div>
        ))}
      </div>

      {/* QR SCANNER OVERLAY */}
      {scanEventId && (
        <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-50 p-4">
          <h2 className="text-white text-xl mb-4">Scan QR Code</h2>

          <div
            id="qr-scanner"
            className="w-full max-w-lg h-96 bg-white rounded shadow"
          />

          {scannedData && (
            <p className="text-white mt-3">
              Last Scanned: <span className="font-bold">{scannedData}</span>
            </p>
          )}

          {/* List of scanned QR */}
          <div className="mt-4 text-white w-full max-w-lg bg-white/10 p-3 rounded">
            <h3 className="font-semibold mb-2">Scanned QR Entries:</h3>
            <ul className="max-h-40 overflow-y-auto text-sm">
              {qrList.map((qr) => (
                <li key={qr._id} className="border-b py-1">
                  {qr.data}
                </li>
              ))}
            </ul>
          </div>

          {/* Close Scanner */}
          <button
            onClick={() => {
              if (html5QrcodeRef.current) {
                html5QrcodeRef.current.stop().catch(() => {});
                html5QrcodeRef.current.clear().catch(() => {});
              }
              setScanEventId(null);
            }}
            className="mt-5 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Close Scanner
          </button>
        </div>
      )}

      {/* Add Modal */}
      {isAdding && (
        <EventModal
          title="Add New Event"
          formData={formData}
          setFormData={setFormData}
          onClose={() => {
            setIsAdding(false);
            setFormData({});
          }}
          onSubmit={handleAddEvent}
          backendUrl={backendUrl}
        />
      )}

      {/* Edit Modal */}
      {selectedEvent && (
        <EventModal
          title="Edit Event"
          formData={formData}
          setFormData={setFormData}
          onClose={() => {
            setSelectedEvent(null);
            setFormData({});
          }}
          onSubmit={handleUpdate}
          backendUrl={backendUrl}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
