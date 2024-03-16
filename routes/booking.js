const router = require("express").Router();

const Booking = require("../models/Booking");

/* CREATE BOOKING */
router.post("/create", async (req, res) => {
  try {
    const {
      email,
      hostId,
      listingId,
      roomType,
      roomCount,
      adult,
      children,
      startDate,
      endDate,
      totalPrice,
      status,
      paymentStatus,
      type,
      contact,
      userId,
      razorpay_order_id,
      razorpay_payment_id,
    } = req.body;

    console.log("create booking route hit ", req.body);
    const newBooking = new Booking({
      email,
      hostId,
      listingId,
      roomType,
      roomCount,
      adult,
      children,
      startDate,
      endDate,
      placeType: type,
      contact,
      userId,
      totalPrice,
      status,
      paymentStatus,
      razorpay_order_id,
      razorpay_payment_id,
    });
    const resp = await newBooking.save();
    console.log(resp);
    res.status(200).json(newBooking);
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .json({ message: "Fail to create a new Booking!", error: err.message });
  }
});

// for getting all bookings of a particular user
router.post("/getUserBookingData", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("email : ", email);
    const booking = await Booking.find({ email });
    res.json({ booking });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
