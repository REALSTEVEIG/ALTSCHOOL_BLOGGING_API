const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");

const mongoUrl = process.env.MONGO_URL.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(mongoUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("DB connection successful!");
  })
  .catch((err) => {
    console.log("could not connect to MongoDB");
    console.log(err);
  });

app.listen(process.env.PORT, (err) => {
  if (err) {
    console.log(err);
  }
  console.log(`App running on port ${process.env.PORT}`);
});
