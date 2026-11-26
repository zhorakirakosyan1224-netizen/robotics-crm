const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance } = require('../controllers/attendanceController');

router.get('/', getAttendance);
router.post('/', markAttendance);

module.exports = router;