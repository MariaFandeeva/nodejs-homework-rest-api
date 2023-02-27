const mongoose = require("mongoose");

const app = require("./app");

const { DB_HOST } = require("./config.js");

mongoose.set("strictQuery", false);

mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(3001);
  })
  .then(console.log("Database connection succsess"))
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });
