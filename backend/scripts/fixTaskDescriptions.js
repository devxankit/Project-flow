/*
  Fix existing task descriptions that contain raw customer IDs.
  Replaces occurrences of the customer ObjectId with the actual customer name.
*/

const mongoose = require('mongoose');
require('dotenv').config();

// Ensure all models that Task middleware depends on are registered first
require('../models/Subtask');
const Task = require('../models/Task');
const Customer = require('../models/Customer');

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
}

async function run() {
  await connect();
  console.log('Connected to MongoDB');

  const customers = await Customer.find({}).select('_id name');
  const idToName = new Map(customers.map(c => [String(c._id), c.name || 'Customer']));

  const tasks = await Task.find({}).select('_id description customer');
  let updated = 0;

  for (const task of tasks) {
    const cid = String(task.customer);
    const name = idToName.get(cid);
    if (!name) continue;
    const before = task.description || '';
    if (before.includes(cid)) {
      const after = before.split(cid).join(name);
      if (after !== before) {
        task.description = after;
        await task.save({ validateBeforeSave: false });
        updated += 1;
        console.log(`Updated task ${task._id}`);
      }
    }
  }

  console.log(`Done. Updated ${updated} tasks.`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Fix script error:', err);
  process.exit(1);
});


