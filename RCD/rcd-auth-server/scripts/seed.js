const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/user');

dotenv.config({ path: __dirname + '/../.env' });

async function run() {
  const uri = process.env.DB_CONNECTION;
  if (!uri) {
    console.error('DB_CONNECTION not set in .env. Start a local MongoDB (see RCD/docker-compose.yml) or set DB_CONNECTION.');
    process.exit(1);
  }

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB for seeding');

  const adminEmail = 'admin@example.com';
  const managerEmail = 'manager@example.com';

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = new User({ username: 'admin', email: adminEmail, password: 'Admin123!', role: 'admin' });
    await admin.save();
    console.log('Created admin user ->', adminEmail);
  }

  let manager = await User.findOne({ email: managerEmail });
  if (!manager) {
    manager = new User({ username: 'manager', email: managerEmail, password: 'Manager123!', role: 'team_manager' });
    await manager.save();
    console.log('Created team_manager user ->', managerEmail);
  }

  console.log('Seeding complete');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
