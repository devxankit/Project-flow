console.log('Starting simple test...');

try {
  require('dotenv').config({ path: '../.env' });
  console.log('✅ dotenv loaded');
  
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Found' : 'Not found');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
  
  const mongoose = require('mongoose');
  console.log('✅ mongoose loaded');
  
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ram312908_db_user:Ankit@cluster0.vigazjy.mongodb.net/Project-flow';
  
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('✅ Connected to MongoDB');
    mongoose.connection.close();
    console.log('✅ Test completed successfully');
  }).catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
