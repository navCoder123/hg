import React from "react";

const EventCard = ({ event, onEdit, onDelete, backendUrl }) => {
  return (
    <div className="p-4 border rounded shadow hover:shadow-lg transition cursor-pointer">
      <img
        src={event.imageUrl ? `${backendUrl}${event.imageUrl}` : "https://via.placeholder.com/400x200"}
        alt={event.title}
        className="w-full h-48 object-cover rounded mb-2"
      />
      <h2 className="text-xl font-semibold">{event.title}</h2>
      <p>₹{Number(event.amount).toLocaleString("en-IN")}</p>
      <p className="text-gray-500">{event.date}</p>
      <div className="flex gap-2 mt-2">
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          onClick={() => onEdit(event)}
        >
          Edit
        </button>
        <button
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          onClick={() => onDelete(event._id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default EventCard;
