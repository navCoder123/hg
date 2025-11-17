import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const EventModal = ({ title, formData, setFormData, onClose, onSubmit }) => {
  const [uploading, setUploading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append("image", file);

    try {
      setUploading(true);
      const { data } = await axios.post(`${backendUrl}/api/events/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData({ ...formData, imageUrl: data.imageUrl });
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white p-6 rounded w-full max-w-lg"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Title"
            value={formData.title || ""}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Amount"
            value={formData.amount || ""}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="date"
            placeholder="Date"
            value={formData.date || ""}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Location"
            value={formData.location || ""}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Genre"
            value={formData.genre || ""}
            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <textarea
            placeholder="Description"
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border rounded"
          />

          {/* Image URL input */}
          <input
            type="text"
            placeholder="Image URL"
            value={formData.imageUrl || ""}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="w-full p-2 border rounded"
          />

          {/* File upload */}
          <div>
            <label className="block mb-1 font-medium">Upload Image:</label>
            <input type="file" onChange={handleFileChange} />
            {uploading && <p className="text-gray-500 text-sm">Uploading...</p>}
          </div>

          {/* Preview */}
          {formData.imageUrl && (
            <img
              src={`${backendUrl}${formData.imageUrl}`}
              alt="Preview"
              className="w-full h-48 object-cover rounded mt-2"
            />
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Submit
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EventModal;
