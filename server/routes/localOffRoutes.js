const express = require('express');
const router = express.Router();
const localOffController = require('../controllers/localOffController');

//before phase routes
router.post('/before', localOffController.submitLocalOffCampusBefore);

//after phase routes
router.post('/after', localOffController.submitLocalOffCampusAfter);

router.get('/:offId', localOffController.getLocalOffCampusForm);

module.exports = router;