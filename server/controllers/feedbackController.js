// controllers/feedbackController.js
const Feedback = require('../models/Feedback');
const User = require('../models/User'); // Assuming you have a User model

exports.submitFeedback = async (req, res) => {
  try {
    const { formId, feedback, formType } = req.body;
    const userId = req.user._id; // From auth middleware

    // Validate required fields
    if (!formId || !feedback || !formType) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prepare feedback data based on user type
    const feedbackData = {
      formId,
      formType,
      userId,
      userType: user.role, // 'Organization', 'Authority', or 'Admin'
      email: user.email,
      feedback,
      rating // Include the rating
    };

    // Add user-type specific fields
    if (user.role === 'Organization') {
      feedbackData.organizationName = user.organizationName;
    } else {
      feedbackData.firstName = user.firstName;
      feedbackData.lastName = user.lastName;
      if (user.role === 'Authority') {
        feedbackData.faculty = user.faculty;
      }
    }

    const newFeedback = new Feedback(feedbackData);
    await newFeedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: newFeedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getFeedbackForForm = async (req, res) => {
  try {
    const { formId } = req.params;

    const feedbackList = await Feedback.find({ formId })
      .sort({ createdAt: -1 })
      .lean();

    // Format response based on user type
    const formattedFeedback = feedbackList.map(feedback => {
      const response = {
        _id: feedback._id,
        formId: feedback.formId,
        formType: feedback.formType,
        email: feedback.email,
        feedback: feedback.feedback,
        createdAt: feedback.createdAt,
        userType: feedback.userType
      };

      if (feedback.userType === 'Organization') {
        response.organizationName = feedback.organizationName;
      } else {
        response.name = `${feedback.firstName} ${feedback.lastName}`;
        if (feedback.userType === 'Authority') {
          response.faculty = feedback.faculty;
        }
      }

      return response;
    });

    res.status(200).json({
      success: true,
      data: formattedFeedback
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};