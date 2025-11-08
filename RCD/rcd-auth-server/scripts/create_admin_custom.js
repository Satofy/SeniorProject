const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/user');

dotenv.config({ path: __dirname + '/../.env' });

async function run() {
  const uri = process.env.DB_CONNECTION;
  if (!uri) {
    console.error('DB_CONNECTION not set in .env. Start a local MongoDB or set DB_CONNECTION.');
    process.exit(1);
  }

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB for creating custom admin');

  const adminEmail = process.argv[2] || 'admin@RCD.com';
  const adminPassword = process.argv[3] || 'admin@123';

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = new User({ username: 'admin', email: adminEmail, password: adminPassword, role: 'admin' });
    await admin.save();
    console.log('Created admin user ->', adminEmail);
  } else {
    console.log('Admin user already exists ->', adminEmail);
  }

  console.log('Done');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
