const { response } = require("express");
const Availability = require("../models/Availability");
const router = require("express").Router();
const Listing = require("../models/Listing");

// Controller function to create new availability
router.post("/createAvailabilities", async (req, res) => {
  try {
    const { hotelId, type } = req.body;
    if (type === "Rooms") {
      const { date } = req.body;
      console.log(date);

      const exist = await Availability.find({ date, hotelId });
      if (exist.length > 0) {
        res.status(200).json({ message: "date and hotel already exist" });
      } else {
        const newAvailability = await Availability.create(req.body);
        res.status(201).json(newAvailability);
      }
    } else {
      const { startDate, endDate } = req.body;
      // console.log("DATES", startDate, endDate, hotelId);
      let availability = await Availability.findOne({ hotelId });

      if (availability) {
        // If availability exists, update the dates
        availability.entirePlaceAvailability = [{ startDate, endDate }];
      } else {
        // If no availability exists, create a new entry
        availability = new Availability({
          hotelId,
          entirePlaceAvailability: [{ startDate, endDate }],
        });
      }

      await availability.save();

      res.status(200).send(availability);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/availabilities/date-hotel", async (req, res) => {
  const { date, hotelId } = req.query;
  try {
    const availability = await Availability.findOne({ date, hotelId });
    if (!availability) {
      return res.status(404).json({ message: "Availability not found" });
    }
    res.status(200).json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// for checking availability of room at the time of final booking
router.post("/availability/particular-room", async (req, res) => {
  const { hotelId, type } = req.body;

  try {
    if (type === "An entire place") {
      const { startDate, endDate } = req.body;

      let availability = await Availability.findOne({ hotelId });

      if (!availability) {
        return res
          .status(404)
          .send({ available: false, message: "Hotel not found" });
      }

      // Convert dates to Date objects
      const start = new Date(startDate);
      const end = new Date(endDate);

      let isAvailable = false;

      // Check if any availability period covers the desired booking dates
      for (let period of availability.entirePlaceAvailability) {
        const periodStart = new Date(period.startDate);
        const periodEnd = new Date(period.endDate);

        if (start >= periodStart && end <= periodEnd) {
          isAvailable = true;
          break;
        }
      }

      if (isAvailable) {
        res
          .status(200)
          .send({ available: true, message: "Hotel is available" });
      } else {
        res.status(200).send({
          available: false,
          message: "Hotel is not available for the selected dates",
        });
      }
    } else {
      const { roomType, roomNum, date } = req.body;
      console.log("Date", date);

      const availability = await Availability.find({
        hotelId: hotelId,
        date: { $in: date },
      });
      console.log("availability", availability);
      // res.json({ availability });
      if (availability.length == 0) {
        return res.json({
          message: "Availability not found",
          code: 2,
          roomAvailability: false,
        });
      }
      if (
        !availability ||
        availability.length < 1 ||
        availability.length !== date.length
      ) {
        return res.json({
          message: "Availability not found",
          code: 2,
          roomAvailability: false,
        });
      }
      let roomAvailability = true;
      let temp;
      availability.forEach((element) => {
        temp = element.rooms.filter((elem) => elem.roomType == roomType);
        console.log("temp", temp);

        if (temp.length > 0 && temp[0].max < temp[0].booked + roomNum) {
          roomAvailability = false;
        } else if (temp.length === 0) {
          roomAvailability = false;
        }
      });

      res.status(200).json({
        //   max: availability.rooms[roomType].max,
        //   booked: availability.rooms[roomType].booked,
        data: availability,
        roomAvailability,
        temp,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Controller function to get all availabilities
const getAllAvailabilities = async (req, res) => {
  try {
    const availabilities = await Availability.find();
    res.status(200).json(availabilities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller function to get availability by ID
const getAvailabilityById = async (req, res) => {
  const { id } = req.params;
  try {
    const availability = await Availability.findById(id);
    if (!availability) {
      return res.status(404).json({ message: "Availability not found" });
    }
    res.status(200).json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller function to update availability by ID
const updateAvailabilityById = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedAvailability = await Availability.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    if (!updatedAvailability) {
      return res.status(404).json({ message: "Availability not found" });
    }
    res.status(200).json(updatedAvailability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller function to delete availability by ID
const deleteAvailabilityById = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedAvailability = await Availability.findByIdAndDelete(id);
    if (!deletedAvailability) {
      return res.status(404).json({ message: "Availability not found" });
    }
    res.status(200).json({ message: "Availability deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// router.get("/testavail", async (req, res) => {
//   try {
//     res.json({ msg: "Availability route working" });
//   } catch (error) {
//     console.log(error.message);
//   }
// });

// router.post("/searchPage", async (req, res) => {
//   const { search, checkIn, checkOut, guest } = req.body;

//   try {
//     function getDatesInRange(startDate, endDate) {
//       const dates = [];
//       // Convert input strings to Date objects
//       const start = new Date(startDate);
//       const end = new Date(endDate);

//       // Loop through the dates between start and end dates
//       for (let date = start; date < end; date.setDate(date.getDate() + 1)) {
//         // Push each date to the array
//         dates.push(new Date(date));
//       }

//       // Convert dates array to string format 'yyyy-mm-dd'
//       const formattedDates = dates.map((date) => {
//         return date.toISOString().split("T")[0];
//       });

//       return formattedDates;
//     }
//     const datesInRange = getDatesInRange(checkIn, checkOut);
//     // console.log(datesInRange);
//     let listings = [];
//     if (search && checkIn && checkOut && guest) {
//       const result = [];
//       if (search === "all") {
//         listings = await Listing.find();
//       } else {
//         listings = await Listing.find({
//           $or: [
//             { category: { $regex: search, $options: "i" } },
//             { title: { $regex: search, $options: "i" } },
//             { city: { $regex: search, $options: "i" } },
//             { type: { $regex: search, $options: "i" } },
//           ],
//         });
//       }

//       const checkAvailabilityEntirePlace = async (hotelId) => {
//         let temp = "Not Available";
//         const availability = await Availability.find({
//           hotelId,
//           date: { $in: datesInRange },
//         });
//         if (
//           availability.length == 0 ||
//           availability.length !== datesInRange.length
//         ) {
//           temp = "Not Available";
//         }
//         let availabilityEntire = true;
//         availability.forEach((element) => {
//           if (element.bookingStatus !== "Available") {
//             availabilityEntire = false;
//           }
//         });
//         if (availabilityEntire) {
//           temp = "Available";
//         } else {
//           temp = "Not Available";
//         }

//         return temp;
//       };

//       const checkAvailabilityRooms = async (hotelId) => {
//         let temp = "Not Available";

//         const availability = await Availability.find({
//           hotelId,
//           date: { $in: datesInRange },
//         });
//         // console.log(availability)
//         if (availability.length == 0) {
//           temp = "Not Available";
//           // console.log("some text")
//         }
//         if (
//           !availability ||
//           availability.length < 1 ||
//           availability.length !== datesInRange.length
//         ) {
//           temp = "Not Available";
//         } else {
//           let temp1;
//           availability.forEach((element) => {
//             temp1 = element.rooms.map((elem) => {
//               // console.log(elem)
//               if (elem.max > elem.booked) {
//                 temp = "Available";
//               } else {
//               }
//             });
//           });
//         }
//         return temp;
//       };

//       const someData = listings.filter(async (element) => {
//         const { hotelId, type } = element;
//         if (type === "An entire place") {
//           const value = await checkAvailabilityEntirePlace(hotelId);
//           if (value === "Available") {
//             result.push(element);
//             return true;
//           } else {
//             return false;
//           }
//         } else if (type === "Rooms") {
//           // console.log(element)
//           const value = await checkAvailabilityRooms(hotelId);
//           console.log(value);
//           if (value === "Available") {
//             // console.log(element)
//             result.push(element);
//             // console.log(result);
//             return true;
//           } else {
//             return false;
//           }
//         }
//         return false;
//       });

//       if (someData.length>0) {
//         res.json({ result });
//         console.log(result)

//       }
//     }
//   } catch (error) {
//     res
//       .status(404)
//       .json({ message: "Fail to fetch listings", error: err.message });
//     console.log(err);
//   }
// });

router.post("/searchPage", async (req, res) => {
  const { search, checkIn, checkOut, guest } = req.body;

  try {
    function getDatesInRange(startDate, endDate) {
      const dates = [];
      // Convert input strings to Date objects
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Loop through the dates between start and end dates
      for (let date = start; date < end; date.setDate(date.getDate() + 1)) {
        // Push each date to the array
        dates.push(new Date(date));
      }

      // Convert dates array to string format 'yyyy-mm-dd'
      const formattedDates = dates.map((date) => {
        return date.toISOString().split("T")[0];
      });

      return formattedDates;
    }
    const datesInRange = getDatesInRange(checkIn, checkOut);
    // console.log(datesInRange);
    let listings = [];
    if (
      search &&
      checkIn !== "undefined" &&
      checkOut !== "undefined" &&
      guest
    ) {
      console.log(req.body);
      const result = [];
      if (search === "all") {
        listings = await Listing.find({ guestCount: { $gte: guest } });
      } else {
        listings = await Listing.find({
          $and: [
            {
              $or: [
                { category: { $regex: search, $options: "i" } },
                { title: { $regex: search, $options: "i" } },
                { city: { $regex: search, $options: "i" } },
                { type: { $regex: search, $options: "i" } },
                { province: { $regex: search, $options: "i" } },
              ],
            },
            { guestCount: { $gte: guest } },
          ],
        });
      }

      const checkAvailabilityEntirePlace = async (hotelId) => {
        let temp = "Not Available";
        const availability = await Availability.find({
          hotelId,
          date: { $in: datesInRange },
        });
        if (
          availability.length == 0 ||
          availability.length !== datesInRange.length
        ) {
          temp = "Not Available";
        }
        let availabilityEntire = true;
        availability.forEach((element) => {
          if (element.bookingStatus !== "Available") {
            availabilityEntire = false;
          }
        });
        if (availabilityEntire) {
          temp = "Available";
        } else {
          temp = "Not Available";
        }

        return temp;
      };

      const checkAvailabilityRooms = async (hotelId) => {
        let temp = "Not Available";

        const availability = await Availability.find({
          hotelId,
          date: { $in: datesInRange },
        });
        // console.log(availability)
        if (availability.length == 0) {
          temp = "Not Available";
          // console.log("some text")
        }
        if (
          !availability ||
          availability.length < 1 ||
          availability.length !== datesInRange.length
        ) {
          temp = "Not Available";
        } else {
          let temp1;
          availability.forEach((element) => {
            temp1 = element.rooms.map((elem) => {
              // console.log(elem)
              if (elem.max > elem.booked) {
                temp = "Available";
              } else {
              }
            });
          });
        }
        return temp;
      };

      const someData = await Promise.all(
        listings.map(async (element) => {
          const { hotelId, type } = element;
          if (type === "An entire place") {
            const value = await checkAvailabilityEntirePlace(hotelId);
            if (value === "Available") {
              result.push(element);
              return true;
            } else {
              return false;
            }
          } else if (type === "Rooms") {
            // console.log(element)
            const value = await checkAvailabilityRooms(hotelId);
            console.log(value);
            if (value === "Available") {
              // console.log(element)
              result.push(element);
              // console.log(result);
              return true;
            } else {
              return false;
            }
          }
          return false;
        })
      );

      if (result.length > 0) {
        res.json({ result });
        console.log(result);
      } else {
        res.json({ result });
      }
    } else if (search) {
      console.log("inside else block");
      let newListings;
      if (search === "all") {
        newListings = await Listing.find({ guestCount: { $gte: guest } });
      } else {
        newListings = await Listing.find({
          $and: [
            {
              $or: [
                { category: { $regex: search, $options: "i" } },
                { title: { $regex: search, $options: "i" } },
                { city: { $regex: search, $options: "i" } },
                { type: { $regex: search, $options: "i" } },
                { province: { $regex: search, $options: "i" } },
              ],
            },
            { guestCount: { $gte: guest } },
          ],
        });
        res.json({ result: newListings });
      }
    }
  } catch (error) {
    res
      .status(404)
      .json({ message: "Fail to fetch listings", error: err.message });
    console.log(err);
  }
});

module.exports = router;
