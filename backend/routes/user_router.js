const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user_model");

router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 8).then((hashedPassword) => {
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
    });
    user
      .save()
      .then((response) => {
        res.status(201).json({
          message: "User Created Successfully",
          result: response,
        });
      })
      .catch((e) => {
        res.status(500).json({
          error: e,
        });
      });
  });
});

router.post("/login", (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email }).then((user) => {
    if (!user) {
      return res.status(401).json({
        message: "Login Failed",
      });
    }
    fetchedUser = user;
    return bcrypt
      .compare(req.body.password, user.password)
      .then((result) => {
        if (!result) {
          return res.status(401).json({
            message: "Login Failed",
          });
        }
        const token = jwt.sign(
          { email: fetchedUser.email, userId: fetchedUser._id },
          "osamaPDuZIalMisvZ8BYIO2daAd2dmiSKGnuwdtA2CRenTmerinFicAngauladr",
          { expiresIn: "1h" }
        );
        console.log(token);
        res.status(200).json({
          token: token,
          expiresIn: 3600,
          userId: fetchedUser._id,
        });
      })
      .catch((e) => {
        return res.status(401).json({
          message: "Login Failed",
        });
      });
  });
});

module.exports = router;
