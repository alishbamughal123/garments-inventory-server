const fs = require('fs');
const path = require('path');

console.log('CWD:', process.cwd());
console.log('__dirname:', __dirname);

try {
  console.log('Root dir contents:', fs.readdirSync(process.cwd()));
} catch (e) {
  console.log('Cannot read CWD:', e.message);
}

// Try to find the cert automatically
function findCert(dir, depth = 0) {
  if (depth > 3) return;
  try {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      if (f.includes('.crt') || f.includes('.pem') || f.toLowerCase().includes('cert')) {
        console.log('Found candidate:', path.join(dir, f));
      }
      const full = path.join(dir, f);
      if (f !== 'node_modules' && f !== '.git' && fs.statSync(full).isDirectory()) {
        findCert(full, depth + 1);
      }
    }
  } catch (e) {}
}
findCert(process.cwd());

const app = require("./app");
const env = require("./config/env");
const {
  startReminderWorker,
} = require("./modules/task/task-reminder.service");
const ensureDefaultAdmin = require("../prisma/seed");

app.listen(env.port, async () => {
  await ensureDefaultAdmin();
  startReminderWorker();
  console.log("========================================");
  console.log(
    `Server running on port ${env.port}`
  );
  console.log("========================================");
});
