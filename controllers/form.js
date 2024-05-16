const Form = require("../models/Form");

exports.postForm = async (req, resp, next) => {
  try {
    const {
      name,
      mail,
      phone,
      street,
      add,
      pin,
      country,
      amount,
      adult,
      selectedDate,
      children,
    } = req.body;

    const formData = new Form({
      name,
      mail,
      phone,
      street,
      add,
      pin,
      country,
      amount,
      adult,
      selectedDate,
      children,
    });

    const savedFormData = await formData.save();
    console.log("Form data saved:", savedFormData);

    // Call the sendInvoiceByEmail function here if needed
    resp.status(200).json({
      success: true,
      message: "Data saved successfully",
    });
  } catch (error) {
    next(error);
  }
};
