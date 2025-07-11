const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import your models
const Question = require('./models/Question');
const User = require('./models/User');

async function importToAtlas() {
  try {
    // Connect to Atlas MongoDB (make sure MONGODB_URI is updated to Atlas connection string)
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
    console.log('✅ Connected to MongoDB Atlas');

    const exportsDir = path.join(__dirname, 'exports');

    // Import Questions
    console.log('📥 Importing questions...');
    const questionsData = JSON.parse(
      fs.readFileSync(path.join(exportsDir, 'questions.json'), 'utf8')
    );
    
    // Clear existing questions and import new ones
    await Question.deleteMany({});
    await Question.insertMany(questionsData);
    console.log(`✅ Imported ${questionsData.length} questions`);

    // Import Users
    console.log('📥 Importing users...');
    const usersData = JSON.parse(
      fs.readFileSync(path.join(exportsDir, 'users.json'), 'utf8')
    );
    
    // Clear existing users and import new ones
    await User.deleteMany({});
    await User.insertMany(usersData);
    console.log(`✅ Imported ${usersData.length} users`);

    console.log('🎉 Import completed successfully!');
    console.log('✅ Your data is now in MongoDB Atlas');

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

importToAtlas(); 