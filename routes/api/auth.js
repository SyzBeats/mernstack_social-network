const router = require("express").Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error);
  }
});

router.post("/auth", [check("email", "please enter a valid Email").isEmail(), check("password", "Password is required").exists()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    let user = await User.findOne({ email });

    //user exists
    if (!user) {
      return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
    }

    //Check matching Pwds
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ errors: [{ msg: "Invalid Credentials" }] });
    }
    //create payload

    const payLoad = {
      user: {
        id: user.id //can be used in mongoose due to abstraction od ._id
      }
    };

    jwt.sign(payLoad, config.get("jwtSecret"), { expiresIn: 36000 }, (err, token) => {
      if (err) {
        throw err;
      }
      res.json({ token });
    });

    //Return JSON Web Token
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
