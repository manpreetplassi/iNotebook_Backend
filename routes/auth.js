const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const fetchuser = require('../middlewere/fetchuser');

// User model
const User = require('../models/User');

// Route 1 : Endpoint to create a new user http://localhost:5000/api/auth/createUser
router.post('/createUser', [
    body('name', "Enter a valid name").isLength({ min: 4 }),
    body('email', "Enter a valid Email").isEmail(),
    body('password', "Password must be more than 6 characters").isLength({ min: 6 })
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Extract validated data from the request body
    const { name, email, password } = req.body;

    try {
        // Check if user with given email already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }

        // Generate salt and hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user with hashed password
        user = new User({ name, email, password: hashedPassword });

        // Save user to database
        await user.save();

        // Generate JWT token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, 'yourSecretKey', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            // Return the token
            res.status(201).json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }

});



// Route 2 : Endpoint to authenticate user http://localhost:5000/api/auth/login
router.post('/login', [
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password is required').exists()
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Extract email and password from the request body
    const { email, password } = req.body;

    try {
        // Check if user with given email exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ errors: [{ msg: 'Invalid credentials' }] });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
        }

        // Generate JWT token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, 'yourSecretKey', (err, token) => {
            // jwt.sign(payload, 'yourSecretKey', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            // Return the token
            res.status(200).json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }

});

// Route 3 : Endpoint to authenticate user http://localhost:5000/api/auth/getuser
router.post('/getuser',fetchuser, async (req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("server error");
    }
})


module.exports = router;
