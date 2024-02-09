const Booking = require("../models/bookingModel");

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const {
      user,
      listing,
      roomType,
      quantity,
      checkIn,
      checkOut,
      totalPrice,
      status,
    } = req.body;

    // Add the current date and time
    const createdAt = new Date();

    const booking = new Booking({
      user,
      listing,
      roomType,
      quantity,
      checkIn,
      checkOut,
      totalPrice,
      status,
      createdAt,
    });
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single booking by ID
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a booking by ID
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a booking by ID
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ message: "Booking deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check availability of rooms of a particular type in a particular hotel for a given date or date range
const checkRoomAvailability = async (req, res) => {
  try {
    const { hotelId, roomType, startDate, endDate } = req.body;

    // Find bookings for the specified hotel, room type, and overlapping date range
    const overlappingBookings = await Booking.find({
      listing: hotelId,
      roomType,
      $or: [
        { checkIn: { $lt: endDate }, checkOut: { $gt: startDate } },
        { checkIn: { $gte: startDate, $lte: endDate } },
        { checkOut: { $gte: startDate, $lte: endDate } },
      ],
    });

    // Calculate total booked rooms for the specified date range
    const totalBookedRooms = overlappingBookings.reduce(
      (total, booking) => total + booking.quantity,
      0
    );

    // Find total available rooms of the specified type for the hotel
    // Note: You should fetch this information from the hotel's listing
    const totalAvailableRooms = 10; // Example value, replace with actual logic to fetch available rooms

    // Calculate available rooms
    const availableRooms = totalAvailableRooms - totalBookedRooms;

    res.json({ availableRooms });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  checkRoomAvailability,
};
