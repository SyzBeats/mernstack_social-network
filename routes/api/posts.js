const router = require('express').Router();

//* route:  GET /api/posts
//* desc:   Test
//* access: Public
router.get('/', (req, res) => {
  res.send('Posts Route');
});

module.exports = router;
