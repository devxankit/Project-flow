/*
  Seed demo data:
  - Logs in as PM (email/password from args or env)
  - Fetches existing 6 users and selects:
    * 1 PM (the logged-in PM)
    * 3-4 employees (from active users)
    * 2-3 customers (existing) for association as `customer` user on Customer model
      If fewer than 5 customer users exist, it will create temporary customer users
  - Creates 5 Customers
    * Each with 2-3 Tasks
    * Each Task with 2-3 Subtasks
  - Distributes varied statuses, due dates, and assignments
*/

const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({ path: require('path').join(__dirname, '..', '.env') });

const API_BASE = process.env.API_BASE_URL || 'http://localhost:' + (process.env.PORT || 5000) + '/api';

const PM_EMAIL = process.env.SEED_PM_EMAIL || 'ankit@gmail.com';
const PM_PASSWORD = process.env.SEED_PM_PASSWORD || 'Ankit@1399';

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

async function login() {
  const res = await axios.post(`${API_BASE}/auth/login`, {
    email: PM_EMAIL,
    password: PM_PASSWORD,
  });
  if (!res.data?.success) throw new Error('Login failed');
  return res.data.token;
}

async function getAllUsers(token) {
  // PM-only route; pagination large enough to fetch all
  const res = await axios.get(`${API_BASE}/users?page=1&limit=200`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.data?.status !== 'success') throw new Error('Failed to fetch users');
  return res.data.data.users;
}

function getExistingCustomerUsers(users) {
  return users.filter(u => u.role === 'customer' && u.status === 'active');
}

function pickEmployees(users, maxCount) {
  const employees = users.filter(u => (u.role === 'employee' || u.role === 'pm') && u.status === 'active');
  // Shuffle simple
  for (let i = employees.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [employees[i], employees[j]] = [employees[j], employees[i]];
  }
  return employees.slice(0, maxCount);
}

async function createCustomer(token, pmUserId, customerUserId, assignedTeam, nameIdx) {
  const payload = {
    name: `Customer ${nameIdx}: Website Revamp`,
    description: `Customer ${nameIdx} engagement for revamp and integrations`,
    status: ['planning', 'active', 'on-hold'][nameIdx % 3],
    priority: ['normal', 'high', 'urgent'][nameIdx % 3],
    dueDate: daysFromNow(21 + nameIdx * 3),
    customer: customerUserId,
    assignedTeam: assignedTeam.map(u => u._id || u.id),
    tags: ['demo', 'seed'],
    visibility: 'team',
  };
  const res = await axios.post(`${API_BASE}/customers`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.data?.success) throw new Error('Create customer failed');
  return res.data.data.customer;
}

async function createTask(token, customerId, createdById, seq, titleSuffix, assignedTo, customerName) {
  const statuses = ['pending', 'in-progress', 'completed'];
  const status = statuses[seq % statuses.length];
  const payload = {
    title: `Task ${seq}: ${titleSuffix}`,
    description: `Task ${seq} for customer ${customerName}`,
    customer: customerId,
    status,
    priority: ['normal', 'high', 'urgent'][seq % 3],
    assignedTo: assignedTo || [],
    // Mix of past and future dates to test overdue and remaining days
    dueDate: seq % 3 === 0 ? daysFromNow(-3) : daysFromNow(7 + seq * 2),
    sequence: seq,
  };
  const res = await axios.post(`${API_BASE}/tasks`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.data?.success) throw new Error('Create task failed');
  return res.data.data.task;
}

async function createSubtask(token, customerId, taskId, seq, titleSuffix, assignedTo, taskTitle) {
  const statuses = ['pending', 'in-progress', 'completed'];
  const status = statuses[(seq + 1) % statuses.length];
  const payload = {
    title: `Subtask ${seq}: ${titleSuffix}`,
    description: `Subtask ${seq} for task ${taskTitle}`,
    task: taskId,
    customer: customerId,
    status,
    priority: ['normal', 'high', 'urgent'][seq % 3],
    assignedTo: assignedTo || [],
    dueDate: seq % 2 === 0 ? daysFromNow(-1 * seq) : daysFromNow(3 + seq),
    sequence: seq,
  };
  const res = await axios.post(`${API_BASE}/subtasks`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.data?.success) throw new Error('Create subtask failed');
  return res.data.data.subtask;
}

async function run() {
  console.log('Logging in as PM...');
  const token = await login();
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  console.log('Fetching users...');
  const users = await getAllUsers(token);
  const pm = users.find(u => u.email?.toLowerCase() === PM_EMAIL.toLowerCase());
  if (!pm) throw new Error('PM user not found in list');

  const customerUsers = getExistingCustomerUsers(users);
  if (customerUsers.length === 0) {
    throw new Error('No existing customer users found. Please create at least 1 customer user and rerun.');
  }
  const employeesPool = pickEmployees(users, 4);

  console.log('Creating 5 customers with tasks and subtasks...');
  for (let i = 1; i <= 5; i++) {
    const teamCount = 2 + (i % Math.min(3, employeesPool.length));
    const assignedTeam = employeesPool.slice(0, teamCount);
    const customerUser = customerUsers[(i - 1) % customerUsers.length];

    const customer = await createCustomer(token, pm._id || pm.id, customerUser._id || customerUser.id, assignedTeam, i);
    console.log(`Customer created: ${customer.name} (${customer._id})`);

    const taskCount = 2 + (i % 2); // 2 or 3
    for (let t = 1; t <= taskCount; t++) {
      // Assign 1-2 team members to each task
      const taskAssignees = assignedTeam.slice(0, 1 + (t % Math.min(2, assignedTeam.length)) ).map(u => u._id || u.id);
      const task = await createTask(token, customer._id, pm._id || pm.id, t, `Feature ${t}`, taskAssignees, customer.name || `Customer ${i}`);
      console.log(`  Task created: ${task.title} (${task._id})`);

      const subCount = 2 + ((i + t) % 2); // 2 or 3
      for (let s = 1; s <= subCount; s++) {
        // Assign 0-1 assignees to subtasks
        const subAssignees = taskAssignees.slice(0, s % 2);
        const sub = await createSubtask(token, customer._id, task._id, s, `Work item ${s}`, subAssignees, task.title);
        console.log(`    Subtask created: ${sub.title} (${sub._id})`);
      }
    }
  }

  console.log('Seeding complete.');
}

run().catch(err => {
  console.error('Seeding error:', err.response?.data || err.message);
  process.exit(1);
});


