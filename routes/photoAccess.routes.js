const express = require("express");

const router = express.Router();

const protect = require(
  "../middleware/auth.middleware"
);

const {
  requestPhotoAccess,
  getIncomingRequests,
  getMyRequests,
  approveRequest,
  rejectRequest,
  cancelRequest
} = require(
  "../controllers/photoAccess.controller"
);


// Send Request
router.post(
  "/request/:userId",
  protect,
  requestPhotoAccess
);


// Incoming Requests
router.get(
  "/incoming",
  protect,
  getIncomingRequests
);


// My Sent Requests
router.get(
  "/my-requests",
  protect,
  getMyRequests
);


// Approve
router.patch(
  "/approve/:requestId",
  protect,
  approveRequest
);


// Reject
router.patch(
  "/reject/:requestId",
  protect,
  rejectRequest
);


// Cancel
router.delete(
  "/cancel/:requestId",
  protect,
  cancelRequest
);

module.exports = router;