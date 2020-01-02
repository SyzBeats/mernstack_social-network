const router = require("express").Router();

//* route:  GET /api/profile
//* desc:   Test
//* access: Public
router.get("/", (req, res) => {
  res.send("Profile Route");
});

module.exports = router;
