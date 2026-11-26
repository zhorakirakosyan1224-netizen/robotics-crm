const express = require('express');
const router = express.Router();
const { addPayment, getFinanceSummary } = require('../controllers/financeController');

router.get('/summary', getFinanceSummary);
router.post('/pay', addPayment);

module.exports = router;