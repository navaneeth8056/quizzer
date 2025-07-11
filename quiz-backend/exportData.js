const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import your models
const Question = require('./models/Question');
const User = require('./models/User');

async function exportData() {
  try {
    // Connect to local MongoDB
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
    console.log('✅ Connected to local MongoDB');

    // Create exports directory
    const exportsDir = path.join(__dirname, 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir);
    }

    // Export Questions
    console.log('📤 Exporting questions...');
    const questions = await Question.find({});
    fs.writeFileSync(
      path.join(exportsDir, 'questions.json'),
      JSON.stringify(questions, null, 2)
    );
    console.log(`✅ Exported ${questions.length} questions`);

    // Export Users
    console.log('📤 Exporting users...');
    const users = await User.find({});
    fs.writeFileSync(
      path.join(exportsDir, 'users.json'),
      JSON.stringify(users, null, 2)
    );
    console.log(`✅ Exported ${users.length} users`);

    console.log('🎉 Export completed! Check the "exports" folder for your data files.');
    console.log('📁 Files created:');
    console.log('   - exports/questions.json');
    console.log('   - exports/users.json');

  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

exportData(); 