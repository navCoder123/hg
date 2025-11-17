import mongoose, { Schema } from "mongoose";

const bookingSchema = new mongoose.Schema({
    bookingId: { type: String, default: '' },
    paymentId: {type: String, default: ''},
})

const bookingModel = mongoose.model.booking || mongoose.model('booking', bookingSchema);

export default bookingModel;