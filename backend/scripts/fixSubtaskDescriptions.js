/*
  Fix existing subtask descriptions that contain raw task IDs.
  Replaces occurrences of the task ObjectId with the actual task title.
*/

const mongoose = require('mongoose');
require('dotenv').config();

const Task = require('../models/Task');
const Subtask = require('../models/Subtask');

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
}

async function run() {
  await connect();
  console.log('Connected to MongoDB');

  const tasks = await Task.find({}).select('_id title');
  const idToTitle = new Map(tasks.map(t => [String(t._id), t.title || 'Task']));

  const subs = await Subtask.find({}).select('_id description task');
  let updated = 0;

  for (const st of subs) {
    const tid = String(st.task);
    const title = idToTitle.get(tid);
    if (!title) continue;
    const before = st.description || '';
    if (before.includes(tid)) {
      const after = before.split(tid).join(title);
      if (after !== before) {
        st.description = after;
        await st.save({ validateBeforeSave: false });
        updated += 1;
        console.log(`Updated subtask ${st._id}`);
      }
    }
  }

  console.log(`Done. Updated ${updated} subtasks.`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Fix script error:', err);
  process.exit(1);
});


