const router = require("express").Router();

const Booking = require("../models/Booking");
const Availability = require("../models/Availability");

/* CREATE BOOKING */
router.post("/create", async (req, res) => {
  const {
    email,
    hostId,
    listingId,
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
        listingId,
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
    const { email } = req.body;
    console.log("email : ", email);
    const booking = await Booking.find({ email });
    const temp = booking.reverse();
    console.log(temp);
    res.json({ booking: temp });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
