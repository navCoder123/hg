import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  genre: { type: String, required: true },
  imageUrl: { type: String },
  description: { type: String },
}, { timestamps: true });

const Event = mongoose.model("Event", eventSchema);
export default Event;
