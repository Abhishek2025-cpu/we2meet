const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
    sendInvite,
    acceptInvite,
    rejectInvite
} = require('../controllers/invitationController');

router.post('/send', authMiddleware, sendInvite);
router.put('/accept/:invitationId', authMiddleware, acceptInvite);
router.put('/reject/:invitationId', authMiddleware, rejectInvite);

module.exports = router;