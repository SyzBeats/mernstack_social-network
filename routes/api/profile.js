const router = require('express').Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');

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

//* route:  GET /api/profile
//* desc:   Get all profiles
//* access: Public

router.get('/', async (req, res) => {
  try {
    let profiles = await Profile.find().populate('User', ['name', 'avatar']);
    return res.json(profiles);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error Getting all Profiles' });
  }
});

//* route:  GET /api/profile/user/:userID
//* desc:   Get Profile by User ID
//* access: Public

router.get('/user/:userID', async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.params.userID }).populate('User', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({
        message: 'Profile not found',
      });
    }

    return res.json(profile);
  } catch (error) {
    console.error(error.message);
    //Check if the error is caused because of invalid object ID
    if (error.kind == 'ObjectId') {
      return res.status(400).json({
        message: 'Profile not found',
      });
    }
    return res.status(500).json({ message: 'Error Getting all Profiles' });
  }
});

//* route:  Delete /api/profile/user/:userID
//* desc:   Delete profile, user and posts
//* access: Private
router.delete('/', auth, async (req, res) => {
  try {
    //@todo Remoce Users Posts

    //remove Profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //remove User
    await User.findOneAndRemove({ _id: req.user.id });
    return res.status(200).json({ message: 'User was removed' });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'server Error' });
  }
});

//* route:  PUT /api/profile/experience
//* desc:   Add Profile experience
//* access: Private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Please enter a title')
        .not()
        .isEmpty(),
      check('company', 'Please enter a company')
        .not()
        .isEmpty(),
      check('from', 'From Date is required')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, company, location, from, to, current, description } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();

      res.status(201).json(profile);
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: 'Server Error' });
    }
  }
);

//* route:  DELETE /api/profile/experience/exp_id
//* desc:   Add Profile experience
//* access: Private

router.delete('/experience/:expID', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    /*remove index
      finds the index of the item with given ID
      maps through experience
      returns just ID
      Match ID and get index of element that matches
     */
    const removeIndex = profile.experience.map(item => item._id).indexOf(req.params.expID);

    //remove this item from existing Dataset
    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'server error' });
  }
});

module.exports = router;
