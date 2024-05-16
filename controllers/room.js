const Room = require("../models/room");

exports.getRooms = async (req, res, next) => {
  try {
    const allRooms = await Room.find({});
    res.status(200).json(allRooms);
    // console.log(allRooms);
  } catch (error) {
    next(error);
  }
};

exports.getRoom = async (req, res, next) => {
  const id = req.params.id;

  try {
    const room = await Room.findOne({ id });

    if (!room) {
      const error = new Error("No rooms found!");
      error.statusCode(404);
      next(err);
    }

    res.status(200).json(room);
  } catch (error) {
    next(error);
  }
};

exports.updateRoom = async (req, res, next) => {
  const id = req.params.id;
  const {
    rooms,
    roomprice,
    roomprice1,
    roomprice2,
    trip,
    roomno1,
    roomno2,
    roomno3,
  } = req.body;

  try {
    // Update the room data in the database
    await Room.updateOne(
      { id },
      {
        rooms,
        roomprice,
        roomprice1,
        roomprice2,
        trip,
        roomno1,
        roomno2,
        roomno3,
        lastUpdate: new Date().toISOString(),
        status: "updated",
      },
      { upsert: true }
    );
    updatedStatus[id] = true;

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

exports.deleteRoom = async (req, res, next) => {
  const roomId = req.params.id;

  try {
    // Delete the room from the database
    await Room.deleteOne({ _id: roomId });

    res
      .status(200)
      .json({ success: true, message: "Room deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getUpdatedStatus = (req, res, next) => {
  try {
    res.json(updatedStatus);
  } catch (error) {
    next(error);
  }
};
