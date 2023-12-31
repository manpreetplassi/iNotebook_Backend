const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");
const { isAuth, sanitizeUser } = require("../middlewere/userAuth");
const passport = require("passport");

// Route 1 : Endpoint to create a new user /api/auth/createUser
router.post(
  "/createUser",
  [
    body("name", "Enter a valid name").isLength({ min: 4 }),
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password must be more than 6 characters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new User({ name, email, password: hashedPassword });

      await user.save();
      req.login(sanitizeUser(user), (err) => {
        if (err) {
          res.status(400).json(err);
        } else {
          const token = jwt.sign(
            sanitizeUser(user),
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1h" }
          );
          res.cookie("jwt", token, {
            expires: new Date(Date.now() + 3600000),
            httpOnly: true,
          });
          res.json(sanitizeUser(user));
        }
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// Route 2 : Endpoint to authenticate user /api/auth/login
router.post("/login", passport.authenticate('local'), async (req, res) => {
  try {
    res.cookie("jwt", req.user, {
      expires: new Date(Date.now() + 3600000),
      httpOnly: true,
    });
    res.status(200).json(req.user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.get("/checkAuth", passport.authenticate('jwt'), async (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.sendStatus(401);
  }
});

router.get("/signout", async (req, res) => {
  res
    .cookie("jwt", "", {
      expires: new Date(0),
      httpOnly: true,
      path: "/", // Set the path of the cookie
    })
    .sendStatus(200)
    // .json({status: "logout"})
});

// Route 3 : Endpoint to authenticate user /api/auth/getuser
router.post("/getuser", isAuth(), async (req, res) => {
  const {id} = req.user;
  try {
    const user = await User.findById(id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
});

module.exports = router;
