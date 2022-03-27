const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());
app.use("/public", express.static(`${process.cwd()}/public`));
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Schema = new mongoose.Schema({
  username: String,
});

const User = mongoose.model("User", Schema);

app.post("/api/users", async (req, res) => {
  const username = req.body.username;
  const user = new User({ username });
  await user.save((err, data) => {
    res.json({
      username: data.username,
      _id: data.id,
    });
  });
});

app.get("/api/users", async (req, res) => {
  const result = await User.find({});
  res.json(result);
});

app.listen(3000);
