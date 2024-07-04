const router = require("express").Router();
const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const User = require("../models/User");
const Availability = require("../models/Availability");

/* CREATE BOOKING */
router.post("/create", async (req, res) => {
  const {
    email,
    hostId,
    hotelId,
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
    guestCount,
  } = req.body;
  let newBooking;

  if (type === "Rooms") {
    const { roomType, roomCount, datesArray } = req.body;

    console.log("create booking route hit ", req.body);
    newBooking = new Booking({
      email,
      hostId,
      hotelId,
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

    // console.log("dates array : ", datesArray);
    for (const date of datesArray) {
      const availability = await Availability.findOneAndUpdate(
        {
          date: date,
          hotelId: hotelId,
          "rooms.roomType": roomType, // Search within rooms array for specific roomType
        },
        {
          $inc: { "rooms.$.booked": roomCount }, // Increment the booked count for the matching roomType
        },
        { new: true } // Return the modified document after update
      );
    }
    // const data = await Availability.findByIdAndUpdate()
  } else {
    const { hotelId } = req.body;
    console.log(hotelId);

    try {
      let availability = await Availability.findOne({ hotelId });

      if (!availability) {
        return res.status(404).send({ error: "Hotel not found" });
      }

      // Convert dates to Date objects
      const start = new Date(startDate);
      const end = new Date(endDate);

      const entirePlaceAvailability = [];

      availability.entirePlaceAvailability.forEach((period) => {
        const periodStart = new Date(period.startDate);
        const periodEnd = new Date(period.endDate);

        if (end < periodStart || start > periodEnd) {
          // No overlap
          entirePlaceAvailability.push(period);
        } else {
          // Overlap exists, split the periods
          if (start > periodStart) {
            entirePlaceAvailability.push({
              startDate: periodStart,
              endDate: start,
            });
          }
          if (end < periodEnd) {
            entirePlaceAvailability.push({
              startDate: end,
              endDate: periodEnd,
            });
          }
        }
      });

      availability.entirePlaceAvailability = entirePlaceAvailability;
      await availability.save();
      newBooking = new Booking({
        email,
        hostId,
        hotelId,
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
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Server error" });
    }
  }

  await newBooking.save();
  res.status(200).json(newBooking);
});

// for getting all bookings of a particular user
router.post("/getUserBookingData", async (req, res) => {
  try {
    const { id, type } = req.body;

    let booking;
    if (type === "user") {
      booking = await Booking.find({ userId: id });
    } else {
      booking = await Booking.find({ hostId: id });
    }

    const bookingData = booking.reverse();

    const userData = await User.findOne(
      {
        _id: new mongoose.Types.ObjectId(bookingData.userId),
      },
      { firstName: 1, lastName: 1, contact: 1 }
    );

    res.json({ message: "Bookings!", booking: bookingData, userData });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
