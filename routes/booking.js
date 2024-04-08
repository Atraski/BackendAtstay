const router = require("express").Router();

const Booking = require("../models/Booking");
const Availability = require("../models/Availability");

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
      datesArray,
      guestCount,
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
      guestCount,
    });
    const resp = await newBooking.save();

    if (type === "Rooms") {
      // console.log("dates array : ", datesArray);
      for (const date of datesArray) {
        const availability = await Availability.findOneAndUpdate(
          {
            date: date,
            hotelId: listingId,
            "rooms.roomType": roomType, // Search within rooms array for specific roomType
          },
          {
            $inc: { "rooms.$.booked": roomCount }, // Increment the booked count for the matching roomType
          },
          { new: true } // Return the modified document after update
        );
        console.log("Updated availability : ", availability);
      }
      // const data = await Availability.findByIdAndUpdate()
    } else if (type === "An entire place") {
      for (const date of datesArray) {
        const availability = await Availability.findOneAndUpdate(
          { date: date, hotelId: listingId },
          { bookingStatus: "booked" },
          { new: true }
        );
      }
    }
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
    const temp = booking.reverse();
    res.json({ booking: temp });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
