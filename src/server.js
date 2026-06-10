const app = require("./app");
const env = require("./config/env");

app.listen(env.port, () => {
  console.log("========================================");
  console.log(
    `Server running on port ${env.port}`
  );
  console.log("========================================");
});
