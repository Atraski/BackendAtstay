const express = require("express");

const roomsController = require("../controllers/room");

const router = express.Router();

router.get("rooms/all", roomsController.getRooms);

router.get("rooms/:id", roomsController.getRoom);

router.put("rooms1/:id", roomsController.updateRoom);

router.delete("rooms/:id", roomsController.deleteRoom);

router.get("rooms/updated-status", roomsController.getUpdatedStatus);

module.exports = router;
