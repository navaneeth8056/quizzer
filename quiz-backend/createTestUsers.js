const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  // Create test users
  const testUsers = [
    {
      email: 'test1@example.com',
      name: 'Test User 1',
      username: 'testuser1',
      referralCode: 'REF001',
      fikaPoints: 150,
      quizScores: [
        { chapter: 1, score: 85, date: new Date() },
        { chapter: 2, score: 90, date: new Date() }
      ],
      unlockedModules: {
        '1': [1, 2, 3],
        '2': [1, 2]
      }
    },
    {
      email: 'test2@example.com',
      name: 'Test User 2',
      username: 'testuser2',
      referralCode: 'REF002',
      fikaPoints: 200,
      quizScores: [
        { chapter: 1, score: 95, date: new Date() }
      ],
      unlockedModules: {
        '1': [1, 2, 3, 4],
        '2': [1, 2, 3]
      }
    },
    {
      email: 'student@example.com',
      name: 'John Student',
      username: 'johnstudent',
      referralCode: 'REF003',
      fikaPoints: 75,
      quizScores: [
        { chapter: 1, score: 70, date: new Date() }
      ],
      unlockedModules: {
        '1': [1, 2]
      }
    }
  ];

  try {
    // Clear existing test users (optional)
    await User.deleteMany({ email: { $in: testUsers.map(u => u.email) } });
    
    // Insert test users
    const result = await User.insertMany(testUsers);
    console.log(`✅ Created ${result.length} test users`);
    console.log('Test users created successfully!');
  } catch (err) {
    console.error('Error creating test users:', err);
  } finally {
    mongoose.disconnect();
  }
}); 