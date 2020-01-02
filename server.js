const express = require('express');
const app = express();
const connectDB = require('./database');
const PORT = process.env.PORT || 5000;

connectDB();

const usersAPI = require('./routes/api/users');
const postsAPI = require('./routes/api/posts');
const profileAPI = require('./routes/api/profile');
const authAPI = require('./routes/api/auth');

//middleware Route Access
app.use(express.json({ extended: false }));

app.use('/api/users', usersAPI);
app.use('/api/posts', postsAPI);
app.use('/api/profile', profileAPI);
app.use('/api/auth', authAPI);

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(PORT, () => {
  console.log('listening...');
});
