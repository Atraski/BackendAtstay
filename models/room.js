const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    id: String, // You might want to use ObjectId or a more specific type
    rooms: Number,
    roomprice: String,
    roomprice1: String,
    roomprice2: String,
    trip:String,
    status:String,
    roomno1:String,
    roomno2:String,
    roomno3:String,
    
  lastUpdate: {
    type: Date,
    default: Date.now,
  },

  isUpdated: {
    type: Boolean,
    default: false,
  },

  });
  
  const Room = mongoose.model('Room', roomSchema);
  module.exports = Room;
