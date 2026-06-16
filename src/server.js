const app = require("./app");
const env = require("./config/env");
const {
  startReminderWorker,
} = require("./modules/task/task-reminder.service");

app.listen(env.port, () => {
  startReminderWorker();
  console.log("========================================");
  console.log(
    `Server running on port ${env.port}`
  );
  console.log("========================================");
});
