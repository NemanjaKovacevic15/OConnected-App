const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const normalize = require('normalize-url');
const jwt = require('jsonwebtoken');
const config = require('config');
const logger = require('../../config/logger');
const { check, validationResult } = require('express-validator');

// @route  POST api/users
// @desc   Register User route
// @access Public

router.post(
  '/',
  [
    //Check if name field is not empty
    check('name', 'Name is required').not().isEmpty(),
    // email must be an email
    check('email', 'Please include valid email').isEmail(),
    // password must be at least 5 chars long
    check(
      'password',
      'Password should have at least five or more characters'
    ).isLength({ min: 5 }),
  ],
  async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      //If User exists then error
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      //Get users gravatar
      const avatar = normalize(
        gravatar.url(email, {
          s: '200',
          r: 'pg',
          d: 'mm',
        }),
        { forceHttps: true }
      );
      //New instance of a User
      user = new User({
        name,
        email,
        avatar,
        password,
      });

      //Encrypt password
      var salt = await bcrypt.genSaltSync(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

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
      res.status(500).send('Internal Server Error');
    }
  }
);

module.exports = router;
