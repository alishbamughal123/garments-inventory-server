const app = require("./app");

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log("========================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("========================================");
});