const express = require('express');
const router = express.Router();
const { createOrUpdatePlan, getAllPlans, getPlanById, deletePlan } = require('../controllers/subscriptionController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = authMiddleware.adminMiddleware;

router.post('/create', authMiddleware, adminMiddleware, createOrUpdatePlan);
router.get('/get-all', getAllPlans);
router.get('/get-by-id/:id', getPlanById);
router.delete('/delete/:id', authMiddleware, adminMiddleware, deletePlan);

module.exports = router;