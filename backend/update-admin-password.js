const mongoose = require('mongoose');
const Admin = require('./src/models/admin.model');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:Almighty1995@cluster0.gpmz9sr.mongodb.net/agriconnect?retryWrites=true&w=majority';
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Find the admin user
      const admin = await Admin.findOne({ email: 'major@gmail.com' });
      
      if (!admin) {
        console.log('Admin not found!');
        mongoose.connection.close();
        return;
      }

      // Update the password
      admin.password = 'Almighty';
      await admin.save();
      
      console.log('✅ Admin password updated successfully!');
      console.log('📧 Email: major@gmail.com');
      console.log('🔑 New Password: Almighty');
      console.log('👤 Role:', admin.role);
      
      mongoose.connection.close();
      console.log('Database connection closed');
      
    } catch (error) {
      console.error('Error updating admin password:', error);
      mongoose.connection.close();
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }); 