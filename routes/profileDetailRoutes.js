const express = require('express');
const router = express.Router();
const { getProfileDetail, reportUser } = require('../controllers/profileDetailController');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/detail/:id', authMiddleware, getProfileDetail);
router.post('/report/:id', authMiddleware, reportUser);

module.exports = router;