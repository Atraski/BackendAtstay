const express = require("express");
require("dotenv").config({ path: "./.env" });
const crypto = require("crypto");
const app = express();
const nodemailer = require("nodemailer"); // Import Nodemailer
const PDFDocument = require("pdfkit"); // Import pdfkit properly
const cheerio = require("cheerio");
require("./Config");
const s = require("./Formatstay");
const Room = require("./room");
const authRoutes = require("./routes/auth.js");
const listingRoutes = require("./routes/listing.js");
const bookingRoutes = require("./routes/booking.js");
const userRoutes = require("./routes/user.js");
const availabilityRoutes = require("./routes/availability.js");
const host = require("./routes/host.js");
const form = require("./Formm");
const pdf = require("html-pdf");
const html_to_pdf = require("html-pdf-node");
var instance = require("./Razorpay");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(express.json());
const cors = require("cors");
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.listen(process.env.PORT);

app.use(express.static("public"));
// we link the router files to make our route easy
// app.use(require("./router/routes.js"));
/* ROUTES */
app.use("/auth", authRoutes);
app.use("/properties", listingRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);
app.use("/api", availabilityRoutes);
app.use("/api", host);

const updatedStatus = {};

const getCurrentDate = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const day = currentDate.getDate().toString().padStart(2, "0");
  return `${day}-${month}-${year}`;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: "atstaytravel@gmail.com",
    pass: "emqr amor owjl fpax",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

app.get("/api/rooms/all", async (req, res) => {
  try {
    const allRooms = await Room.find({});
    res.json(allRooms);
    console.log(allRooms);
  } catch (error) {
    console.error("Error fetching all room data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.delete("/api/rooms/:id", async (req, res) => {
  const roomId = req.params.id;

  try {
    // Delete the room from the database
    await Room.deleteOne({ _id: roomId });

    res.json({ success: true, message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});
app.get("/api/rooms/updated-status", (req, res) => {
  // Send the updated status tracking object to the client
  res.json(updatedStatus);
});

// app.get('/api/rooms/:id', async (req, res) => {
//   const id = req.params.id;

//   try {
//     // Find the room by ID in the database
//     const room = await Room.findById(id);

//     if (!room) {
//       // If the room is not found, return a 404 response
//       return res.status(404).json({ error: 'Room not found' });
//     }

//     // If the room is found, return it in the response
//     res.json(room);
//   } catch (error) {
//     console.error('Error fetching room data by ID:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
app.get("/api/rooms/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const room = await Room.findOne({ id });
    res.json(room || {});
  } catch (error) {
    console.error("Error fetching room data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.put("/api/rooms1/:id", async (req, res) => {
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
    console.error("Error updating room data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API endpoint to update room data
// app.put('/api/rooms1/:id', async (req, res) => {
//   const id = req.params.id;
//   const { rooms, roomprice, roomprice1,roomprice2,trip} = req.body;

//   try {
//     await Room.updateOne({ id }, { rooms, roomprice, roomprice1,roomprice2 ,trip}, { upsert: true });
//     res.json({ success: true });
//   } catch (error) {
//     console.error('Error updating room data:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

app.post("/Order", async (req, resp) => {
  try {
    const { amount } = req.body;
    const option = {
      amount: Number(amount * 100),
      currency: "INR",
    };
    const order = await instance.orders.create(option);

    console.log(order);
    resp.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    resp.status(500).json({
      success: false,
      error: "Error creating order",
    });
  }
});

app.get("/key", (req, resp) => {
  resp.json({ key: process.env.RAZOR_AP1_KEY });
});

app.post("/saveDataToDatabase", async (req, resp) => {
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

    const formData = new form({
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
    console.error("Error saving data:", error);
    resp.status(500).json({
      success: false,
      error: "Error saving data",
    });
  }
});

app.post("/saveDataToDatabase1", async (req, resp) => {
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
      checkin,
      checkoutDate,
      children,
      tripname,
    } = req.body;

    const formData1 = new s({
      name,
      mail,
      phone,
      street,
      add,
      pin,
      country,
      amount,
      adult,
      checkin,
      checkoutDate,
      children,
      tripname,
    });

    const savedFormData1 = await formData1.save();
    // console.log("Form data saved:", savedFormData1);

    // Call the sendInvoiceByEmail function here if needed
    resp.status(200).json({
      success: true,
      message: "Data saved successfully",
    });
  } catch (error) {
    console.error("Error saving data:", error);
    resp.status(500).json({
      success: false,
      error: "Error saving data",
    });
  }
});

app.post("/sendInvoiceByEmail", async (req, resp) => {
  try {
    const { clientEmail, invoiceHTML, hostEmail } = req.body;
    console.log(req.body);

    const generatePDF = async (htmlContent) => {
      return new Promise((resolve, reject) => {
        pdf
          .create(htmlContent, {
            childProcessOptions: {
              env: {
                OPENSSL_CONF: "/dev/null",
              },
            },
          })
          .toBuffer((err, buffer) => {
            if (err) {
              reject(err);
            } else {
              resolve(buffer);
            }
          });
      });
    };

    // Generate PDF from HTML content (assuming you have pdf.create function)
    // Replace the following line with your actual PDF creation logic
    const pdfBuffer = await generatePDF(invoiceHTML);

    // Create Nodemailer email options
    let mailOptions = {
      from: "khushi.singh89208@gmail.com",
      to: clientEmail,
      subject: "Invoice",
      text: "Your payment is Successful thankyou for your reservation ",
      attachments: [
        {
          filename: "Invoice.pdf",
          content: pdfBuffer,
          encoding: "base64",
        },
      ],
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);

    // sending mail to host
    mailOptions = {
      from: "khushi.singh89208@gmail.com",
      to: hostEmail,
      subject: "Booking Invoice",
      text: "There is a new Booking for your property",
      attachments: [
        {
          filename: "Invoice.pdf",
          content: pdfBuffer,
          encoding: "base64",
        },
      ],
    };
    const infoHost = await transporter.sendMail(mailOptions);
    console.log("Email sent:", infoHost.response);

    resp.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    resp.status(500).json({
      success: false,
      error: "Error sending email",
    });
  }
});

// app.post("/sendInvoiceByEmail", async (req, resp) => {
//   try {
//     // Extract data from the request
//     const { clientEmail, invoicePDF } = req.body;
//     if (!clientEmail) {
//       throw new Error("Client email is missing");
//     }
//     console.log("clientEmail", clientEmail);
//     const emailContent = `
//     <p>Dear Customer,</p>
//     <p>Please find attached your invoice.</p>
//     <p>Thank you for your business.</p>
//   `;
//     // Decode base64 data to create a buffer
//     const pdfBuffer = Buffer.from(invoicePDF, "base64");

//     // Create Nodemailer email options
//     const mailOptions = {
//       from: "khushi.singh89208@gmail.com",
//       to: clientEmail,
//       subject: "Invoice",
//       text: "Your payment is Successful thankyou for your reservation ",
//       html: emailContent, // Email content in HTML format
//       attachments: [
//         {
//           filename: "Invoice.pdf",
//           content: pdfBuffer,
//           encoding: "base64",
//         },
//       ],
//     };

//     // Send the email
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Email sent:", info.response);

//     resp.status(200).json({
//       success: true,
//       message: "Email sent successfully",
//     });
//   } catch (error) {
//     console.error("Error sending email:", error);
//     resp.status(500).json({
//       success: false,
//       error: "Error sending email",
//     });
//   }
// });

// You can define other endpoints here

// app.post("/sendInvoiceByEmail", async (req, resp) => {
//   try {
//     const { clientEmail, invoiceHTML, hostEmail } = req.body;

//     // Generate PDF from HTML content
//     const pdfBuffer = await generatePDF(invoiceHTML);

//     // Send invoice email to client
//     const clientMailOptions = {
//       from: "khushi.singh89208@gmail.com",
//       to: clientEmail,
//       subject: "Invoice",
//       text: "Your payment is Successful. Thank you for your reservation.",
//       attachments: [
//         {
//           filename: "Invoice.pdf",
//           content: pdfBuffer,
//           encoding: "base64",
//         },
//       ],
//     };

//     const clientInfo = await transporter.sendMail(clientMailOptions);
//     console.log("Email sent to client:", clientInfo.response);

//     // Send notification email to host
//     const hostMailOptions = {
//       from: "khushi.singh89208@gmail.com",
//       to: hostEmail,
//       subject: "Booking Invoice",
//       text: "There is a new Booking for your property",
//       attachments: [
//         {
//           filename: "Invoice.pdf",
//           content: pdfBuffer,
//           encoding: "base64",
//         },
//       ],
//     };

//     const hostInfo = await transporter.sendMail(hostMailOptions);
//     console.log("Email sent to host:", hostInfo.response);

//     resp.status(200).json({
//       success: true,
//       message: "Emails sent successfully",
//     });
//   } catch (error) {
//     console.error("Error sending emails:", error);
//     resp.status(500).json({
//       success: false,
//       error: "Error sending emails",
//     });
//   }
// });

// async function generatePDF(htmlContent) {
//   return new Promise((resolve, reject) => {
//     const doc = new PDFDocument();
//     const buffers = [];

//     const $ = cheerio.load(htmlContent); // Load HTML content with Cheerio
//     console.log("Parsed HTML:", $.html()); // Log parsed HTML content

//     // Iterate over HTML elements and add them to the PDF
//     $("body")
//       .children()
//       .each((index, element) => {
//         const elementType = element.name;
//         console.log("Element type:", elementType); // Log element type
//         if (elementType === "p") {
//           doc.text($(element).text()); // Add paragraphs
//         } else if (
//           elementType === "h1" ||
//           elementType === "h2" ||
//           elementType === "h3"
//         ) {
//           doc.fontSize(14).text($(element).text()).moveDown(0.5); // Add headings
//         } else if (elementType === "ul" || elementType === "ol") {
//           $(element)
//             .children()
//             .each((index, child) => {
//               doc.text(`- ${$(child).text()}`); // Add lists
//             });
//         } // Add more conditions for other HTML elements as needed
//       });

//     // Pipe the PDF output to buffers
//     doc.on("data", buffers.push.bind(buffers));
//     doc.on("end", () => {
//       const pdfData = Buffer.concat(buffers);
//       resolve(pdfData);
//     });

//     doc.end(); // End the document
//   });
// }
