const express = require('express');
const router = express.Router();
const localOffController = require('../controllers/localOffController');
const LocalOffCampus = require('../models/LocalOffCampus');

router.get("/by-email/:email", async (req, res) => {
    try {
      const email = req.params.email;
      if (!email) return res.status(400).json({ message: "Email is required" });
  
      const forms = await LocalOffCampus.find({
        emailAddress: { $regex: new RegExp(`^${email}$`, "i") },
        submittedBy: req.user._id // Ensure user can only access their own forms
      }).populate('submittedBy', 'name email');
  
      forms.length === 0 
        ? res.status(404).json({ message: "No forms found" }) 
        : res.status(200).json(forms);
    } catch (error) {
      console.error("Error fetching Local Off-Campus forms:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

//before phase routes
router.post('/before', localOffController.submitLocalOffCampusBefore);

//after phase routes
router.post('/after', localOffController.submitLocalOffCampusAfter);

router.get('/:offId', localOffController.getLocalOffCampusForms);

module.exports = router;