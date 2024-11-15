// controllers/emailController.js
const sendNotificationEmail = require('../utils/mailer');

const sendEmailNotification = async (req, res) => {
  const { userEmail, subject, message } = req.body;

  try {
    await sendNotificationEmail(userEmail, subject, message);
    res.status(200).json({ message: 'Notification email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send notification email' });
  }
};

module.exports = {
  sendEmailNotification,
};
