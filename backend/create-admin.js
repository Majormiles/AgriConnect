const mongoose = require('mongoose');
const Admin = require('./src/models/admin.model');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:Almighty1995@cluster0.gpmz9sr.mongodb.net/agriconnect?retryWrites=true&w=majority';
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email: 'major@gmail.com' });
      
      if (existingAdmin) {
        console.log('Admin already exists!');
        console.log('Email:', existingAdmin.email);
        console.log('Role:', existingAdmin.role);
        mongoose.connection.close();
        return;
      }

      // Create the super admin
      const admin = new Admin({
        email: 'major@gmail.com',
        password: 'Almighty',
        firstName: 'Major',
        lastName: 'Administrator',
        role: 'super_admin',
        permissions: [
          { module: 'users', actions: ['read', 'write', 'delete', 'approve', 'moderate'] },
          { module: 'products', actions: ['read', 'write', 'delete', 'approve', 'moderate'] },
          { module: 'orders', actions: ['read', 'write', 'delete', 'approve', 'moderate'] },
          { module: 'logistics', actions: ['read', 'write', 'delete', 'approve', 'moderate'] },
          { module: 'analytics', actions: ['read', 'write', 'delete', 'approve', 'moderate'] },
          { module: 'disputes', actions: ['read', 'write', 'delete', 'approve', 'moderate'] },
          { module: 'system', actions: ['read', 'write', 'delete', 'approve', 'moderate'] }
        ],
        profile: {
          department: 'System Administration',
          notes: 'Super Administrator - Full system access'
        }
      });

      await admin.save();
      
      console.log('✅ Super Admin created successfully!');
      console.log('📧 Email: major@gmail.com');
      console.log('🔑 Password: Almighty');
      console.log('👤 Role: super_admin');
      console.log('🆔 ID:', admin._id);
      
      mongoose.connection.close();
      console.log('Database connection closed');
      
    } catch (error) {
      console.error('Error creating admin:', error);
      mongoose.connection.close();
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }); 