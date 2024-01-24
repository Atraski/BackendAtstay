// const mongoose= require('mongoose')
const mongoose = require('mongoose');

const formDataSchema = new mongoose.Schema({
  razorpay_order_id: String,
  razorpay_payment_id:  String, 
  razorpay_signature: String, 
  name:  String,
  mail:String,
  phone: String,
  street: String, 
  add:Object,
  pin:Number,
  country:String,
  amount:String,
  adult:String,
  checkin:String,
  checkoutDate:String,
  children:String,
  tripname:String,


 
});

const FormData = mongoose.model('Atstay', formDataSchema);

module.exports = FormData;
