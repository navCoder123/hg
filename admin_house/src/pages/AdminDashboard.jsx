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
  const scannerRef = useRef(null);
  const html5QrcodeRef = useRef(null);

  // Fetch events from backend
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

  // Event CRUD
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

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${backendUrl}/api/events/${id}`);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (event) => {
    setSelectedEvent(event);
    setFormData({ ...event });
  };

  // QR Scanner
  const startScanner = (eventId) => {
    setScanEventId(eventId);
    setScannedData("");
    fetchQrList(eventId);
  };

  const fetchQrList = async (eventId) => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/qr/${eventId}`);
      if (data.success) setQrList(data.qrList);
    } catch (err) {
      console.error("Error fetching QR codes:", err);
    }
  };

  // Initialize scanner when scanEventId changes
  useEffect(() => {
    if (!scanEventId || !scannerRef.current) return;

    html5QrcodeRef.current = new Html5Qrcode(scannerRef.current.id);

    html5QrcodeRef.current
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          setScannedData(decodedText);
          try {
            await axios.post(`${backendUrl}/api/qr/scan`, {
              eventId: scanEventId,
              scannedBy: "admin",
              data: decodedText,
            });
            fetchQrList(scanEventId);
          } catch (err) {
            console.error("Error saving QR code:", err);
          } finally {
            html5QrcodeRef.current.stop();
          }
        }
      )
      .catch((err) => console.error("QR scanner failed to start:", err));

    return () => {
      if (html5QrcodeRef.current) html5QrcodeRef.current.stop().catch(() => {});
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

      {/* Events Grid */}
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

      {/* QR Scanner Overlay */}
      {scanEventId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50 p-4">
          <h2 className="text-white text-xl mb-4">Scan QR Code for Event</h2>
          <div
            id="qr-scanner"
            ref={scannerRef}
            className="w-full max-w-lg h-96 bg-white rounded"
          />
          {scannedData && <p className="text-white mt-2">Last scanned: {scannedData}</p>}
          <div className="mt-2 text-white">
            <h3 className="font-semibold">Scanned QR Codes:</h3>
            <ul>
              {qrList.map((qr) => (
                <li key={qr._id}>{qr.data}</li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => setScanEventId(null)}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Close Scanner
          </button>
        </div>
      )}

      {/* Add Event Modal */}
      {isAdding && (
        <EventModal
          title="Add New Event"
          formData={formData}
          setFormData={setFormData}
          onClose={() => { setIsAdding(false); setFormData({}); }}
          onSubmit={handleAddEvent}
          backendUrl={backendUrl}
        />
      )}

      {/* Edit Event Modal */}
      {selectedEvent && (
        <EventModal
          title="Edit Event"
          formData={formData}
          setFormData={setFormData}
          onClose={() => { setSelectedEvent(null); setFormData({}); }}
          onSubmit={handleUpdate}
          backendUrl={backendUrl}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
