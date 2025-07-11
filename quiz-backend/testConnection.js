const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔍 Testing MongoDB Atlas connection...');
    console.log('Connection string:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    await mongoose.connect(process.env.MONGODB_URI, { 
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections found:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your username and password in Atlas');
    console.log('2. Verify network access is set to "Allow Access from Anywhere"');
    console.log('3. Make sure the database user has "Read and write to any database" permissions');
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testConnection(); 