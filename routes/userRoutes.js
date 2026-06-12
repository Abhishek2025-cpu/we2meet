const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/userController');
const upload = require('../middlewares/upload'); 


router.post('/register', upload.fields([
    { name: 'primaryPhoto', maxCount: 1 },
    { name: 'gallery', maxCount: 5 }
]), registerUser);


module.exports = router;