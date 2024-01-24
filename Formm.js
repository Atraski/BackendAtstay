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
  selectedDate:String,
  children:String,
  tripname:String,


 
});

const FormData = mongoose.model('Attour', formDataSchema);

module.exports = FormData;
