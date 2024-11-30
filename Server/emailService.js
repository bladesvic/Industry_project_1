require("dotenv").config(); // Load environment variables

const nodemailer = require("nodemailer");
const mockTransport = require("nodemailer-mock-transport");

// Configure the transporter
const transporter = nodemailer.createTransport(
  process.env.NODE_ENV === "development"
    ? mockTransport() // Use mock transport in development
    : {
        host: process.env.SMTP_HOST, // Real SMTP host
        port: process.env.SMTP_PORT, // SMTP port
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER, // Your email address
          pass: process.env.SMTP_PASS  // Your email password
        }
      }
);

// Function to send an email
async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.FROM_EMAIL || "admin@example.com", // Sender address
    to: to, // Recipient address
    subject: subject, // Subject line
    text: text // Plain text body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(
      process.env.NODE_ENV === "development"
        ? "Mock email sent:" // Log for mock mode
        : `Email sent: ${info.response}` // Log for live email
    );
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Send course update notification
async function sendCourseUpdateEmail(lecturerEmail, lecturerName, courseName, courseSchedule) {
  const subject = `Course Assignment Updated: ${courseName}`;
  const text = `
Dear ${lecturerName},

The details for your assigned course have been updated:

- Course Name: ${courseName}
- Schedule: ${courseSchedule}

Please log in to the system for further information.

Thank you,
Your Institution
`;

  await sendEmail(lecturerEmail, subject, text);
}

// Export the functions
module.exports = { sendEmail, sendCourseUpdateEmail };
