const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const {
    sendInvite,
    acceptInvite,
    rejectInvite,
    getPendingReceivedInvites,
    getAcceptedReceivedInvites
} = require('../controllers/invitationController');

router.post('/send', authMiddleware, sendInvite);
router.put('/accept/:invitationId', authMiddleware, acceptInvite);
router.put('/reject/:invitationId', authMiddleware, rejectInvite);
router.get('/received/pending', authMiddleware, getPendingReceivedInvites);
router.get('/received/accepted', authMiddleware, getAcceptedReceivedInvites);

module.exports = router;