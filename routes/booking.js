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
      razorpay_order_id,
      razorpay_payment_id,
    } = req.body;
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
      totalPrice,
      status,
      paymentStatus,
      razorpay_order_id,
      razorpay_payment_id,
    });
    await newBooking.save();
    res.status(200).json(newBooking);
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .json({ message: "Fail to create a new Booking!", error: err.message });
  }
});

module.exports = router;
