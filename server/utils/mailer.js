// utils/mailer.js
const nodemailer = require('nodemailer');

// Create the transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: process.env.EMAIL_USER, // Vercel will automatically inject this
    pass: process.env.EMAIL_PASS, // Vercel will automatically inject this
  },
});

const sendNotificationEmail = async (recipientEmail, subject, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Use the environment variable for "from" as well
    to: "bladeruneking@gmail.com",
    subject: "test email",
    text: "Hello, This is a notification from StudEvent",
    html: '<p>Hello! This is a test email sent from <b>Nodemailer</b>.</p>',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Notification email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendNotificationEmail;
