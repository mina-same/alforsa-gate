import 'dotenv/config';
import mongoose from 'mongoose';
import { UserSchema } from '../auth/schemas/user.schema';

const UserModel = mongoose.model('User', UserSchema);

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alforsa-gate');

  const existing = await UserModel.findOne({ email: 'admin@example.com' }).select('+password');
  if (existing) {
    console.log('Admin already exists — updating password...');
    existing.password = 'Admin@1234';
    await existing.save();
    console.log('✅ Password updated.');
  } else {
    await UserModel.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'Admin@1234',
      role: 'superadmin',
    });
    console.log('✅ Admin created.');
  }

  console.log('  Email:    admin@example.com');
  console.log('  Password: Admin@1234');
  await mongoose.disconnect();
};

seed().catch((err) => { console.error(err); process.exit(1); });
