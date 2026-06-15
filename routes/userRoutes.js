const express = require('express');
const router = express.Router();
const { registerUser, updateProfile, loginUser, getAllUsers, getUserById } = require('../controllers/userController');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', registerUser);

router.post("/login", loginUser);

router.put('/update-profile', authMiddleware, upload.fields([
    { name: 'primaryPhoto', maxCount: 1 },
    { name: 'gallery', maxCount: 5 }
]), updateProfile);

router.get("/get-all", authMiddleware, getAllUsers);

router.get("/get-by-id/:id", authMiddleware, getUserById);

module.exports = router;