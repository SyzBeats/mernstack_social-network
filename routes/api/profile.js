const router = require('express').Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');

//* route:  GET /api/profile
//* desc:   Test
//* access: Public
router.get('/', (req, res) => {
  res.send('Profile Route');
});

//* route:  GET /api/profile/me
//* desc:   Get current Users Profile
//* access: Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ message: 'There is no Profile for this user' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).mesage.send('Server error');
  }
});

//* route:  POST /api/profile
//* desc:   Create or Update User Profile
//* access: Private

router.post(
  '/',
  [
    auth,
    [
      check('status', 'status is required')
        .not()
        .isEmpty(),
      check('skills', 'skills is required')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin,
      } = req.body;

      // build profile object6

      const profileFields = {};
      profileFields.user = req.user.id;

      if (company) profileFields.company = company;
      if (website) profileFields.website = website;
      if (location) profileFields.location = location;
      if (bio) profileFields.bio = bio;
      if (status) profileFields.status = status;
      if (githubusername) profileFields.githubusername = githubusername;
      if (skills) profileFields.skills = skills.split(',').map(skill => skill.trim());

      profileFields.social = {};

      if (youtube) profileFields.social.youtube = youtube;
      if (facebook) profileFields.social.facebook = facebook;
      if (twitter) profileFields.social.twitter = twitter;
      if (instagram) profileFields.social.instagram = instagram;
      if (linkedin) profileFields.social.linkedin = linkedin;

      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //Update
        console.log('Update');
        updatedProfile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
        return res.json(updatedProfile);
      } else {
        //create new

        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server Error' });
    }
  }
);

module.exports = router;
