const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
require('dotenv').config();
const Question = require('./models/Question');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'https://quiz-learning-platform.vercel.app',
  'http://localhost:3000',
  'http://localhost:5000',
  'https://quiz-learning-platform-fcld.onrender.com'

];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    secure: false,
    sameSite: 'lax'
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  // Use BACKEND_URL from environment variables for callback URL
  callbackURL: process.env.BACKEND_URL + "/auth/google/callback",
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  // Use state param or session fallback for referral code
  const referralCodeFromState = req.query.state || req.session.referralCode;
  console.log('Referral code from req.query.state:', req.query.state);
  console.log('Referral code from req.session.referralCode:', req.session.referralCode);
  console.log('Referral code used for logic:', referralCodeFromState);
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      // Check if user exists with same email
      const existingUser = await User.findOne({ email: profile.emails[0].value });
      if (existingUser) {
        // Link Google account to existing user
        existingUser.googleId = profile.id;
        existingUser.picture = profile.photos[0].value;
        await existingUser.save();
        user = existingUser;
      } else {
        // Create new user
        const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        let referredBy = null;
        let initialPoints = 100;
        if (referralCodeFromState) {
          referredBy = referralCodeFromState;
          initialPoints = 150; // 100 initial + 50 referral bonus
          // Award 100 points to referrer
          console.log('Awarding 100 points to referrer:', referredBy);
          await User.findOneAndUpdate(
            { referralCode: referredBy },
            { $inc: { fikaPoints: 100 } }
          );
        }
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          picture: profile.photos[0].value,
          referralCode,
          referredBy,
          fikaPoints: initialPoints
        });
      }
    }
    // Clear referral code from session after use
    if (req.session.referralCode) delete req.session.referralCode;
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Traditional Authentication Routes

// Signup route
app.post('/auth/signup', async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      name,
      dateOfBirth,
      phoneNumber,
      gender,
      address,
      city,
      state,
      country,
      referralCode
    } = req.body;

    // Validation
    if (!username || !email || !password || !name) {
      return res.status(400).json({ error: 'Username, email, password, and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or username already exists' });
    }

    // Generate referral code
    const userReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    let referredBy = null;
    let initialPoints = 100;

    // Check if user was referred
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        referredBy = referralCode;
        initialPoints = 150; // 100 initial + 50 referral bonus
        // Award 100 points to referrer
        await User.findByIdAndUpdate(referrer._id, { $inc: { fikaPoints: 100 } });
      }
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      name,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      phoneNumber,
      gender,
      address,
      city,
      state,
      country,
      referralCode: userReferralCode,
      referredBy,
      fikaPoints: initialPoints
    });

    // Log in the user
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to log in after signup' });
      }
      res.json({ 
        message: 'User created successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          fikaPoints: user.fikaPoints,
          referralCode: user.referralCode
        }
      });
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login route
app.post('/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or username

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user has password (traditional user)
    if (!user.hasPassword()) {
      return res.status(401).json({ error: 'This account was created with Google. Please use Google sign-in.' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Log in the user
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to log in' });
      }
      res.json({ 
        message: 'Login successful',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          fikaPoints: user.fikaPoints,
          referralCode: user.referralCode
        }
      });
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// Auth routes
app.get('/auth/google', (req, res, next) => {
  // Pass referral code as state param to Google
  const state = req.query.state || req.query.ref || undefined;
  if (state) req.session.referralCode = state;
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state
  })(req, res, next);
});

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: process.env.FRONTEND_URL + '/login' }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL + '/chapters');
  }
);

app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Get all unique chapters
app.get('/api/chapters', async (req, res) => {
  try {
    const chapters = await Question.distinct('chapter');
    chapters.sort((a, b) => a - b);
    res.json({ chapters });
  } catch (err) {
    console.error('Error in /api/chapters:', err);
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

// Get only the first 10 questions by chapter
app.get('/api/questions/:chapter', async (req, res) => {
  try {
    const chapterNum = Number(req.params.chapter);
    if (isNaN(chapterNum)) {
      return res.status(400).json({ error: 'Invalid chapter number' });
    }
    const questions = await Question.find({ chapter: chapterNum }).limit(10);
    res.json({ questions });
  } catch (err) {
    console.error('Error in /api/questions/:chapter:', err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};

// Save quiz score and award points
app.post('/api/quiz/score', requireAuth, async (req, res) => {
  try {
    const { chapter, score, totalQuestions } = req.body;
    const userId = req.user._id;
    // Award 1 point per correct answer (not double)
    const pointsEarned = score;
    // Save score and update points
    await User.findByIdAndUpdate(userId, {
      $push: { quizScores: { chapter, score, date: new Date() } },
      $inc: { fikaPoints: pointsEarned }
    });
    res.json({
      message: 'Score saved successfully',
      pointsEarned,
      newTotalPoints: req.user.fikaPoints + pointsEarned
    });
  } catch (err) {
    console.error('Error saving score:', err);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

// Get user's quiz progress
app.get('/api/user/progress', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      quizScores: user.quizScores,
      fikaPoints: user.fikaPoints,
      unlockedModules: user.unlockedModules || {}
    });
  } catch (err) {
    console.error('Error fetching progress:', err);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Get questions by chapter and module (10 questions per module)
app.get('/api/questions/:chapter/:module', requireAuth, async (req, res) => {
  try {
    const chapterNum = Number(req.params.chapter);
    const moduleNum = Number(req.params.module);
    
    if (isNaN(chapterNum) || isNaN(moduleNum)) {
      return res.status(400).json({ error: 'Invalid chapter or module number' });
    }
    
    const skip = (moduleNum - 1) * 10;
    const questions = await Question.find({ chapter: chapterNum }).skip(skip).limit(10);
    
    res.json({ questions });
  } catch (err) {
    console.error('Error in /api/questions/:chapter/:module:', err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Unlock question module
app.post('/api/unlock/:chapter/:module', requireAuth, async (req, res) => {
  try {
    const chapterNum = String(Number(req.params.chapter));
    const moduleNum = Number(req.params.module);
    const userId = req.user._id;
    if (isNaN(Number(chapterNum)) || isNaN(moduleNum)) {
      return res.status(400).json({ error: 'Invalid chapter or module number' });
    }
    // Check if user has enough points
    const user = await User.findById(userId);
    if (user.fikaPoints < 10) {
      return res.status(400).json({ error: 'Insufficient Fika points' });
    }
    // Update unlockedModules
    const unlocked = user.unlockedModules?.get(chapterNum) || [1];
    if (!unlocked.includes(moduleNum)) unlocked.push(moduleNum);
    await User.findByIdAndUpdate(userId, {
      $inc: { fikaPoints: -10 },
      $set: { [`unlockedModules.${chapterNum}`]: unlocked }
    });
    res.json({
      message: 'Module unlocked successfully',
      newTotalPoints: user.fikaPoints - 10,
      unlockedModules: { ...Object.fromEntries(user.unlockedModules), [chapterNum]: unlocked }
    });
  } catch (err) {
    console.error('Error unlocking module:', err);
    res.status(500).json({ error: 'Failed to unlock module' });
  }
});

// Referral stats endpoint
app.get('/api/user/referrals', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const referredUsers = await User.find({ referredBy: user.referralCode });
    const referralCount = referredUsers.length;
    const referralPoints = referralCount * 100;
    res.json({
      referralCode: user.referralCode,
      referralCount,
      referralPoints
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch referral stats' });
  }
});

// Connect to MongoDB and start server only if successful
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('✅ Connected to MongoDB!');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).send('Page not found. Please use the app navigation.');
}); 