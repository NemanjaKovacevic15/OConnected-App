const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const logger = require('../../config/logger');
const { check, validationResult } = require('express-validator');

// @route  GET api/auth
// @desc   Authentication route
// @access Public

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    logger.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  GET api/users
// @desc   Login User route
// @access Public

router.post(
  '/',
  [
    // email must be an email
    check('email', 'Please include valid email').isEmail(),
    // password must be at least 5 chars long
    check(
      'password',
      'Password should have at least five or more characters'
    ).isLength({ min: 5 }),
  ],
  async (req, res) => {
    // Validation errors in this request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      //Check if user exists
      let user = await User.findOne({ email });
      if (!user) {
        res.status(400).json({
          errors: [{ msg: 'Invalid credentials' }],
        });
      }

      const isMatch = await bcrypt.compare(password, user.password); //Checking the password of a user in DB

      if (!isMatch) {
        res.status(400).json({
          errors: [{ msg: 'Invalid credentials' }],
        });
      }

      //Get payload that includes user id
      const payload = {
        user: {
          id: user.id,
        },
      };
      //Sign token
      jwt.sign(
        payload, //passing payload(User ID)
        config.get('jwtSecret'), //passing secret
        { expiresIn: 3600 }, // expiration
        (err, token) => {
          if (err) throw err; //If we don't get an err we will send back the token to a client
          res.json({ token });
        }
      );
    } catch (err) {
      logger.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
