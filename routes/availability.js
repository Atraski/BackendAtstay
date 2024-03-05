const Availability = require("../models/Availability");
const router = require("express").Router();

// Controller function to create new availability

router.post("/createAvailabilities", async (req, res) => {
  try {
    const { date, hotelId, type } = req.body;
    if (type === "An entire place") {
      const exist = await Availability.find({ date, hotelId });
      if (exist.length > 0) {
        res.status(200).json({ message: "date and hotel already exist" });
      } else {
        const newAvailability = await Availability.create(req.body);
        res.status(201).json(newAvailability);
      }
    } else {
      const exist = await Availability.find({ date, hotelId });
      if (exist.length > 0) {
        res.status(200).json({ message: "date and hotel already exist" });
      } else {
        const newAvailability = await Availability.create(req.body);
        res.status(201).json(newAvailability);
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
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
  const { date, hotelId, roomType, roomNum, type } = req.body;

  try {
    if (type === "An entire place") {
      const availability = await Availability.find({
        hotelId,
        date: { $in: date },
      });

      console.log(availability);
      if (!availability || availability.length < 1) {
        return res
          .status(200)
          .json({ message: "Availability not found", code: 2 });
      }
      res.status(200).json({ availability });
    } else {
      const availability = await Availability.find({
        hotelId: hotelId,
        date: { $in: date },
      });
      console.log(availability);
      if (!availability || availability.length < 1) {
        return res.status(404).json({ message: "Availability not found" });
      }
      let roomAvailability = true;
      let temp;
      availability.forEach((element) => {
        temp = element.rooms.filter((elem) => elem.roomType == roomType);
        console.log(temp);
        if (temp[0].max < temp[0].booked + roomNum) {
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

router.get("/testavail", async (req, res) => {
  try {
    res.json({ msg: "Availability route working" });
  } catch (error) {
    console.log(error.message);
  }
});

module.exports = router;
