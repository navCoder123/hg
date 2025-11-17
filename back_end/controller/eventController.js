import Event from "../models/events.js";

// Get all events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create event
export const createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.json({ success: true, event });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    await Event.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
