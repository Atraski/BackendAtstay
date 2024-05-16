const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    hostId: {
      type: String,
      required: true,
    },
    listingId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
    },
    contact: {
      type: String,
    },
    roomType: {
      type: String,
      required: true,
    },
    roomCount: {
      type: Number,
      required: true,
    },
    placeType: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      required: true,
    },
    razorpay_order_id: {
      type: String,
      required: true,
    },
    razorpay_payment_id: {
      type: String,
      required: true,
    },
    guestCount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", BookingSchema);
module.exports = Booking;
