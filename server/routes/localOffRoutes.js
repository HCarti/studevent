const express = require('express');
const router = express.Router();
const localOffController = require('../controllers/localOffController');
const LocalOffCampus = require('../models/LocalOffCampus');

router.get("/by-user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const forms = await LocalOffCampus.find({
      submittedBy: userId
    }).sort({ submittedAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      data: forms,
      count: forms.length
    });
  } catch (error) {
    console.error("Error fetching Local Off-Campus forms:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error",
      error: error.message 
    });
  }
});

//before phase routes
router.post('/before', localOffController.submitLocalOffCampusBefore);

//after phase routes
router.post('/after', localOffController.submitLocalOffCampusAfter);

router.get('/:offId', localOffController.getLocalOffCampusForms);

module.exports = router;